/**
 * End-to-end user flow smoke tests (run after seed).
 * Usage: npx ts-node scripts/verify-user-flows.ts
 */
import dataSource from "../src/data-source";
import { User } from "../src/entity/user.entity";
import { Organizer } from "../src/entity/organizer.entity";
import { Event } from "../src/entity/event.entity";
import { Booking } from "../src/entity/booking.entity";
import { Payment } from "../src/entity/payment.entity";
import { ApprovalService } from "../src/service/approval.service";
import { BookingService } from "../src/service/booking.service";
import { PaymentService } from "../src/service/payment.service";
import { EventService } from "../src/service/event.service";
import { UserService } from "../src/service/user.service";
import { VerificationStatus } from "../src/enum/verificationStatus.enum";
import { BookingStatus } from "../src/enum/bookingStatus.enum";
import { PaymentMethod } from "../src/enum/paymentMethod.enum";
import { repairSeedState } from "./repair-seed-state-lib";

function assert(condition: boolean, message: string) {
  if (!condition) throw new Error(message);
}

async function main() {
  await dataSource.initialize();
  await repairSeedState(dataSource);
  console.log("✓ Seed state repaired");

  const userRepo = dataSource.getRepository(User);
  const organizerRepo = dataSource.getRepository(Organizer);
  const eventRepo = dataSource.getRepository(Event);
  const bookingRepo = dataSource.getRepository(Booking);
  const paymentRepo = dataSource.getRepository(Payment);

  const userService = new UserService(userRepo);
  const approvalService = new ApprovalService(organizerRepo, eventRepo);
  const bookingService = new BookingService(bookingRepo);
  const paymentService = new PaymentService(paymentRepo);
  const eventService = new EventService(eventRepo);

  const attendee = await userRepo.findOne({
    where: { email: "ayesha.siddiqui@eventify.pk" },
  });
  const approvedOrgUser = await userRepo.findOne({
    where: { email: "ahmed.khan@eventify.pk" },
    relations: ["organizer"],
  });
  const pendingOrgUser = await userRepo.findOne({
    where: { email: "sana.malik@eventify.pk" },
    relations: ["organizer"],
  });
  const rejectedOrgUser = await userRepo.findOne({
    where: { email: "bilal.sheikh@eventify.pk" },
    relations: ["organizer"],
  });
  const admin = await userRepo.findOne({ where: { email: "admin@eventify.pk" } });

  assert(!!attendee, "Attendee seed missing");
  assert(!!approvedOrgUser?.organizer, "Approved organizer seed missing");
  assert(!!pendingOrgUser?.organizer, "Pending organizer seed missing");
  assert(!!rejectedOrgUser?.organizer, "Rejected organizer seed missing");
  assert(!!admin, "Admin seed missing");

  // --- Attendee: verified account (registration + OTP complete in seed) ---
  const attendeeProfile = await userService.findById(attendee!.id);
  assert(!!attendeeProfile?.email, "Attendee profile load failed");
  assert(attendee!.isVerified === true, "Seed attendee should be email-verified");
  console.log("✓ Attendee profile accessible (verified account)");

  // --- Organizer states ---
  assert(
    approvedOrgUser!.organizer!.verificationStatus === VerificationStatus.APPROVED,
    "Approved organizer status"
  );
  assert(
    pendingOrgUser!.organizer!.verificationStatus === VerificationStatus.PENDING,
    "Pending organizer status"
  );
  assert(
    rejectedOrgUser!.organizer!.verificationStatus === VerificationStatus.REJECTED,
    "Rejected organizer status"
  );
  console.log("✓ Organizer pending / approved / rejected states present");

  const approvedEvent = await eventRepo.findOne({
    where: { title: "Lahore Tech Summit 2026" },
    relations: ["organizer"],
  });

  assert(!!approvedEvent, "Seed approved event missing");

  // --- Admin approve / reject organizer (dry run on pending, restore) ---
  const pendingOrgId = pendingOrgUser!.organizer!.id;
  const priorPendingStatus = pendingOrgUser!.organizer!.verificationStatus;
  const rejectResult = await approvalService.rejectOrganizer(
    pendingOrgId,
    admin!.id,
    "Test rejection for verify script"
  );
  assert(!!rejectResult, "Admin reject organizer should succeed");
  await approvalService.approveOrganizer(pendingOrgId, admin!.id);
  const restoredOrg = await organizerRepo.findOne({ where: { id: pendingOrgId } });
  assert(
    restoredOrg?.verificationStatus === VerificationStatus.APPROVED,
    "Organizer should be restorable to approved"
  );
  if (priorPendingStatus === VerificationStatus.PENDING) {
    restoredOrg!.verificationStatus = VerificationStatus.PENDING;
    restoredOrg!.rejectionReason = null;
    await organizerRepo.save(restoredOrg!);
  }
  console.log("✓ Admin reject and approve organizer flow OK");

  // --- Admin approve / reject event (temp event from approved organizer) ---
  const tempEvent = await eventService.createEvent({
    title: "Verify Script Moderation Event",
    description: "Temporary event for admin moderation test",
    address: "Test Hall",
    eventDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    ticketPrice: 1000,
    totalTickets: 100,
    availableTickets: 100,
    organizer: approvedOrgUser!.organizer!,
  } as Partial<Event>);

  const rejectEvent = await approvalService.rejectEvent(
    tempEvent.id,
    admin!.id,
    "Insufficient event details."
  );
  assert(!!rejectEvent, "Admin reject event should succeed");
  const rejectedRow = await eventRepo.findOne({ where: { id: tempEvent.id } });
  assert(
    rejectedRow?.status === VerificationStatus.REJECTED,
    "Event should be rejected"
  );
  assert(
    !!rejectedRow?.rejectionReason,
    "Event rejection reason should be stored"
  );
  const reapproved = await approvalService.approveEvent(tempEvent.id, admin!.id);
  assert(!!reapproved, "Admin approve event should succeed for approved organizer");
  await eventRepo.delete({ id: tempEvent.id });
  console.log("✓ Admin reject and approve event flow OK");

  // --- Attendee booking + payment success ---
  const createBooking = await bookingService.createForAttendee({
    event: approvedEvent!,
    attendee: attendee!,
    quantity: 1,
  });
  assert(!!createBooking.booking, `Booking create failed: ${createBooking.error}`);
  console.log("✓ Attendee booking created:", createBooking.booking!.id);

  const payOk = await paymentService.confirmPayment({
    bookingId: createBooking.booking!.id,
    attendeeId: attendee!.id,
    method: PaymentMethod.CARD,
  });
  assert(payOk.ok, `Payment confirm failed: ${payOk.message}`);
  console.log("✓ Payment success flow OK");

  // --- Payment cancellation (pending booking cancel) ---
  const cancelBooking = await bookingService.createForAttendee({
    event: approvedEvent!,
    attendee: attendee!,
    quantity: 1,
  });
  assert(!!cancelBooking.booking, "Second booking for cancel test failed");
  const cancelled = await bookingService.cancelPendingBooking(cancelBooking.booking!.id);
  assert(cancelled?.status === BookingStatus.CANCELLED, "Cancel should set CANCELLED");
  const payOnCancelled = await paymentService.confirmPayment({
    bookingId: cancelBooking.booking!.id,
    attendeeId: attendee!.id,
    method: PaymentMethod.CARD,
  });
  assert(!payOnCancelled.ok, "Payment on cancelled booking should fail");
  console.log("✓ Payment cancellation guard OK");

  // --- Organizer create event (service level) ---
  const newEvent = await eventService.createEvent({
    title: "Verify Script Test Event",
    description: "Temporary event for flow verification",
    address: "Test Venue",
    eventDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    ticketPrice: 500,
    totalTickets: 50,
    availableTickets: 50,
    status: VerificationStatus.PENDING,
    organizer: approvedOrgUser!.organizer!,
  } as Partial<Event>);
  assert(!!newEvent?.id, "Organizer event create failed");
  assert(newEvent.status === VerificationStatus.PENDING, "New event should be pending");
  await eventRepo.delete({ id: newEvent.id });
  console.log("✓ Organizer create event flow OK");

  console.log("\nVERIFY USER FLOWS: SUCCESS");
  await dataSource.destroy();
}

main().catch(async (err) => {
  console.error("VERIFY USER FLOWS FAILED:", err);
  if (dataSource.isInitialized) await dataSource.destroy();
  process.exit(1);
});
