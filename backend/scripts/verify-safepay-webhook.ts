/**
 * Verifies Safepay webhook signature + confirmPayment idempotency path.
 * Usage: npx ts-node scripts/verify-safepay-webhook.ts
 */
import * as dotenv from "dotenv";
dotenv.config();

import * as crypto from "crypto";
import dataSource from "../src/data-source";
import { Booking } from "../src/entity/booking.entity";
import { User } from "../src/entity/user.entity";
import { Event } from "../src/entity/event.entity";
import { PaymentService } from "../src/service/payment.service";
import { Payment } from "../src/entity/payment.entity";
import { SafepayService } from "../src/service/safepay.service";
import { PaymentMethod } from "../src/enum/paymentMethod.enum";
import { PaymentStatus } from "../src/enum/paymentStatus.enum";
import { BookingService } from "../src/service/booking.service";

function signWebhookLegacy(body: string, secret: string): string {
  return crypto.createHmac("sha512", secret).update(body, "utf8").digest("hex");
}

function signWebhookV2(
  body: string,
  timestamp: string,
  secret: string
): string {
  const signedPayload = `${timestamp}.${body}`;
  const hex = crypto
    .createHmac("sha256", secret)
    .update(signedPayload, "utf8")
    .digest("hex");
  return `sha256=${hex}`;
}

async function main() {
  process.env.SAFEPAY_PUBLIC_KEY =
    process.env.SAFEPAY_PUBLIC_KEY || "test_public";
  process.env.SAFEPAY_SECRET_KEY =
    process.env.SAFEPAY_SECRET_KEY || "test_secret";
  process.env.SAFEPAY_WEBHOOK_SECRET =
    process.env.SAFEPAY_WEBHOOK_SECRET || "test_webhook_secret";

  const payload = JSON.stringify({
    type: "payment.succeeded",
    data: {
      tracker: "track_verify_test_123",
      success: true,
      metadata: { order_id: "1" },
    },
  });

  const sig = signWebhookLegacy(payload, process.env.SAFEPAY_WEBHOOK_SECRET!);
  const verification = SafepayService.verifyWebhookSignature(
    Buffer.from(payload, "utf8"),
    sig
  );
  if (verification.ok === false) {
    throw new Error(`Legacy webhook signature verification failed: ${verification.reason}`);
  }

  const v2Timestamp = "2026-06-17T06:50:00.000Z";
  const v2Sig = signWebhookV2(
    payload,
    v2Timestamp,
    process.env.SAFEPAY_WEBHOOK_SECRET!
  );
  const v2Verification = SafepayService.verifyWebhookSignature(
    Buffer.from(payload, "utf8"),
    v2Sig,
    v2Timestamp
  );
  if (v2Verification.ok === false) {
    throw new Error(`V2 webhook signature verification failed: ${v2Verification.reason}`);
  }

  const parsed = SafepayService.parseWebhookPayload(JSON.parse(payload));
  if (!parsed.isPaymentSuccess || parsed.bookingId !== 1) {
    throw new Error("Webhook payload parsing failed");
  }

  const v2Payload = {
    type: "payment:created",
    notification: {
      tracker: "track_v2_test",
      reference: "42",
      state: "PAID",
      metadata: {
        order_id: {
          key: "order_id",
          value: "42",
        },
      },
    },
  };
  const v2Parsed = SafepayService.parseWebhookPayload(v2Payload);
  if (!v2Parsed.isPaymentSuccess || v2Parsed.bookingId !== 42) {
    throw new Error("V2 notification webhook parsing failed");
  }

  console.log("✓ Webhook signature verification (legacy SHA-512 + V2 SHA-256)");

  await dataSource.initialize();
  const bookingRepo = dataSource.getRepository(Booking);
  const paymentRepo = dataSource.getRepository(Payment);
  const bookingService = new BookingService(bookingRepo);
  const paymentService = new PaymentService(paymentRepo);

  const attendee = await dataSource.getRepository(User).findOne({
    where: { email: "ayesha.siddiqui@eventify.pk" },
  });
  const event = await dataSource.getRepository(Event).findOne({
    where: { title: "Lahore Tech Summit 2026" },
    relations: ["organizer"],
  });

  if (!attendee || !event) {
    throw new Error("Seed data missing");
  }

  const createResult = await bookingService.createForAttendee({
    event,
    attendee,
    quantity: 1,
  });
  if (!createResult.booking) {
    throw new Error(`Create booking failed: ${createResult.error}`);
  }

  const bookingId = createResult.booking.id;
  const tracker = `track_verify_${bookingId}`;

  await paymentService.ensurePendingSafepayPayment({
    bookingId,
    trackerToken: tracker,
    amount: Number(createResult.booking.totalAmount),
  });

  const pending = await paymentRepo
    .createQueryBuilder("payment")
    .where('payment."bookingId" = :bookingId', { bookingId })
    .getOne();
  if (!pending || pending.status !== PaymentStatus.PENDING) {
    throw new Error("Pending payment row was not created at checkout");
  }

  const trackerOnlyPayload = {
    type: "payment:created",
    notification: {
      tracker,
      state: "PAID",
      metadata: { source: "checkout" },
    },
  };
  const trackerOnlyParsed = SafepayService.parseWebhookPayload(trackerOnlyPayload);
  if (trackerOnlyParsed.isPaymentSuccess) {
    const resolved = await paymentService.findBookingIdByTracker(tracker);
    if (resolved !== bookingId) {
      throw new Error("Tracker → booking resolution failed");
    }
  }

  const webhookParsed = SafepayService.parseWebhookPayload({
    type: "payment.succeeded",
    data: {
      tracker,
      success: true,
      metadata: { order_id: String(bookingId) },
    },
  });

  const confirm1 = await paymentService.confirmPayment({
    bookingId: webhookParsed.bookingId!,
    attendeeId: attendee.id,
    method: PaymentMethod.CARD,
    externalTransactionId: webhookParsed.tracker!,
  });
  if (!confirm1.ok || !confirm1.newlyConfirmed) {
    throw new Error(`First confirm failed: ${confirm1.message}`);
  }

  const confirm2 = await paymentService.confirmPayment({
    bookingId: webhookParsed.bookingId!,
    attendeeId: attendee.id,
    method: PaymentMethod.CARD,
    externalTransactionId: webhookParsed.tracker!,
  });
  if (!confirm2.ok || confirm2.newlyConfirmed) {
    throw new Error("Duplicate confirm should be idempotent without newlyConfirmed");
  }

  console.log("✓ Pending payment + tracker resolution + confirmPayment idempotency");
  console.log("\nVERIFY SAFEPAY WEBHOOK: SUCCESS");
  await dataSource.destroy();
}

main().catch(async (err) => {
  console.error("VERIFY SAFEPAY WEBHOOK: FAILED");
  console.error(err?.message || err);
  try {
    await dataSource.destroy();
  } catch {
    /* ignore */
  }
  process.exit(1);
});
