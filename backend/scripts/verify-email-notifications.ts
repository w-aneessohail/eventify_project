/**
 * Smoke test for domain email notifications.
 * Usage: npx ts-node scripts/verify-email-notifications.ts
 *
 * Requires MAIL_USER and MAIL_PASS in .env (e.g. Mailtrap).
 * Set NOTIFY_TEST_TO to override recipient (defaults to seeded attendee email).
 */
import dataSource from "../src/data-source";
import { User } from "../src/entity/user.entity";
import { Organizer } from "../src/entity/organizer.entity";
import { Event } from "../src/entity/event.entity";
import { Booking } from "../src/entity/booking.entity";
import { Payment } from "../src/entity/payment.entity";
import { MailService } from "../src/service/mail.service";
import {
  notifyOrganizerApproved,
  notifyEventApproved,
  notifyBookingConfirmed,
} from "../src/email/notifications";
import { PaymentStatus } from "../src/enum/paymentStatus.enum";
import { BookingStatus } from "../src/enum/bookingStatus.enum";
import { PaymentMethod } from "../src/enum/paymentMethod.enum";

async function main() {
  if (!MailService.isEnabled()) {
    console.log(
      "SKIP: MAIL_USER / MAIL_PASS not set — configure SMTP in .env to run live email test"
    );
    console.log("VERIFY EMAIL NOTIFICATIONS: SKIPPED (SMTP not configured)");
    await dataSource.destroy();
    return;
  }

  await dataSource.initialize();

  const testTo =
    process.env.NOTIFY_TEST_TO?.trim() || "ayesha.siddiqui@eventify.pk";

  const organizer = await dataSource.getRepository(Organizer).findOne({
    where: { organizerName: "Ahmed Khan" },
    relations: ["user"],
  });
  const event = await dataSource.getRepository(Event).findOne({
    where: { title: "Lahore Tech Summit 2026" },
    relations: ["organizer", "organizer.user"],
  });
  const attendee = await dataSource.getRepository(User).findOne({
    where: { email: testTo },
  });
  const booking = await dataSource.getRepository(Booking).findOne({
    where: { attendee: { id: attendee?.id } },
    relations: ["attendee", "event"],
    order: { createdAt: "DESC" },
  });

  if (!organizer?.user || !event || !attendee || !booking) {
    throw new Error("Seed data missing for email verification");
  }

  // Route test emails to NOTIFY_TEST_TO so we don't spam seed accounts in dev
  organizer.user.email = testTo;
  if (event.organizer?.user) event.organizer.user.email = testTo;
  booking.attendee = attendee;
  attendee.email = testTo;

  const mockPayment = {
    id: 0,
    amount: booking.totalAmount,
    method: PaymentMethod.CARD,
    status: PaymentStatus.SUCCESS,
    transactionId: "TEST_TXN",
  } as Payment;

  console.log(`Sending test emails to: ${testTo}`);

  await notifyOrganizerApproved(organizer);
  console.log("✓ Organizer approval email dispatched");

  await notifyEventApproved(event);
  console.log("✓ Event approval email dispatched");

  booking.status = BookingStatus.CONFIRMED;
  await notifyBookingConfirmed(booking, mockPayment);
  console.log("✓ Booking confirmation email dispatched");

  console.log("\nVERIFY EMAIL NOTIFICATIONS: SUCCESS");
  console.log("Check your Mailtrap inbox (or NOTIFY_TEST_TO mailbox).");

  await dataSource.destroy();
}

main().catch(async (err) => {
  console.error("VERIFY FAILED:", err);
  if (dataSource.isInitialized) await dataSource.destroy();
  process.exit(1);
});
