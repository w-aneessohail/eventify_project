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
import { BookingService } from "../src/service/booking.service";

function signWebhook(body: string, secret: string): string {
  return crypto.createHmac("sha512", secret).update(body, "utf8").digest("hex");
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

  const sig = signWebhook(payload, process.env.SAFEPAY_WEBHOOK_SECRET!);
  const valid = SafepayService.verifyWebhookSignature(
    Buffer.from(payload, "utf8"),
    sig
  );
  if (!valid) throw new Error("Webhook signature verification failed");

  const parsed = SafepayService.parseWebhookPayload(JSON.parse(payload));
  if (!parsed.isPaymentSuccess || parsed.bookingId !== 1) {
    throw new Error("Webhook payload parsing failed");
  }

  console.log("✓ Webhook signature and payload parsing");

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
  const webhookPayload = JSON.stringify({
    type: "payment.succeeded",
    data: {
      tracker: `track_verify_${bookingId}`,
      success: true,
      metadata: { order_id: String(bookingId) },
    },
  });
  const webhookParsed = SafepayService.parseWebhookPayload(
    JSON.parse(webhookPayload)
  );

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

  console.log("✓ confirmPayment idempotent via webhook-style call");
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
