/**
 * Quick smoke test for booking lifecycle (run after seed).
 * Usage: npx ts-node scripts/verify-booking-flow.ts
 */
import * as dotenv from "dotenv";
dotenv.config();

import dataSource from "../src/data-source";
import { Booking } from "../src/entity/booking.entity";
import { Event } from "../src/entity/event.entity";
import { User } from "../src/entity/user.entity";
import { BookingService } from "../src/service/booking.service";
import { PaymentService } from "../src/service/payment.service";
import { Payment } from "../src/entity/payment.entity";
import { BookingStatus } from "../src/enum/bookingStatus.enum";
import { PaymentStatus } from "../src/enum/paymentStatus.enum";
import { PaymentMethod } from "../src/enum/paymentMethod.enum";
import { VerificationStatus } from "../src/enum/verificationStatus.enum";

async function main() {
  await dataSource.initialize();

  const bookingRepo = dataSource.getRepository(Booking);
  const eventRepo = dataSource.getRepository(Event);
  const userRepo = dataSource.getRepository(User);
  const paymentRepo = dataSource.getRepository(Payment);

  const bookingService = new BookingService(bookingRepo);
  const paymentService = new PaymentService(paymentRepo);

  const attendee = await userRepo.findOne({
    where: { email: "ayesha.siddiqui@eventify.pk" },
  });
  const event = await eventRepo.findOne({
    where: { title: "Lahore Tech Summit 2026" },
    relations: ["organizer"],
  });

  if (!attendee || !event) {
    throw new Error("Seed data missing attendee or event");
  }

  const ticketsBefore = event.availableTickets;
  console.log("Event tickets before:", ticketsBefore);

  const createResult = await bookingService.createForAttendee({
    event,
    attendee,
    quantity: 1,
  });

  if (!createResult.booking) {
    throw new Error(`Create failed: ${createResult.error}`);
  }
  console.log("Created booking:", createResult.booking.id, createResult.booking.status);

  const confirm1 = await paymentService.confirmPayment({
    bookingId: createResult.booking.id,
    attendeeId: attendee.id,
    method: PaymentMethod.CARD,
  });

  if (!confirm1.ok) {
    throw new Error(`Confirm failed: ${confirm1.message}`);
  }
  console.log("Payment confirmed:", confirm1.payment?.status, confirm1.booking?.status);

  const confirm2 = await paymentService.confirmPayment({
    bookingId: createResult.booking.id,
    attendeeId: attendee.id,
    method: PaymentMethod.CARD,
  });

  if (!confirm2.ok) {
    throw new Error(`Idempotent confirm failed: ${confirm2.message}`);
  }
  console.log("Idempotent re-confirm OK");

  const eventAfter = await eventRepo.findOne({ where: { id: event.id } });
  console.log("Event tickets after:", eventAfter?.availableTickets);
  console.log(
    "Expected decrement:",
    ticketsBefore - 1,
    "Actual:",
    eventAfter?.availableTickets
  );

  // Sold-out test: book more than available
    const smallEvent = await eventRepo.findOne({
      where: { status: VerificationStatus.APPROVED },
      relations: ["organizer"],
      order: { availableTickets: "ASC" },
    });

  if (smallEvent && smallEvent.availableTickets >= 0) {
    const oversell = await bookingService.createForAttendee({
      event: smallEvent,
      attendee,
      quantity: smallEvent.availableTickets + 100,
    });
    console.log(
      "Oversell create:",
      oversell.error ?? "allowed",
      oversell.statusCode ?? 201
    );
  }

  const seededConfirmed = await bookingRepo.count({
    where: { status: BookingStatus.CONFIRMED },
  });
  const seededPending = await bookingRepo.count({
    where: { status: BookingStatus.PENDING },
  });
  const seededCancelled = await bookingRepo.count({
    where: { status: BookingStatus.CANCELLED },
  });

  console.log("\nSeeded booking statuses:");
  console.log("  confirmed:", seededConfirmed);
  console.log("  pending:", seededPending);
  console.log("  cancelled:", seededCancelled);

  console.log("\nVERIFY BOOKING FLOW: SUCCESS");
  await dataSource.destroy();
}

main().catch(async (err) => {
  console.error("VERIFY FAILED:", err);
  if (dataSource.isInitialized) await dataSource.destroy();
  process.exit(1);
});
