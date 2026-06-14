/**
 * Smoke test for approval domain enforcement (run after seed).
 * Usage: npx ts-node scripts/verify-approval.ts
 */
import dataSource from "../src/data-source";
import { Event } from "../src/entity/event.entity";
import { Organizer } from "../src/entity/organizer.entity";
import { User } from "../src/entity/user.entity";
import { ApprovalService } from "../src/service/approval.service";
import { EventService } from "../src/service/event.service";
import { BookingService } from "../src/service/booking.service";
import { Booking } from "../src/entity/booking.entity";
import { VerificationStatus } from "../src/enum/verificationStatus.enum";

function assert(condition: boolean, message: string) {
  if (!condition) throw new Error(message);
}

async function main() {
  await dataSource.initialize();

  const organizerRepo = dataSource.getRepository(Organizer);
  const eventRepo = dataSource.getRepository(Event);
  const userRepo = dataSource.getRepository(User);
  const bookingRepo = dataSource.getRepository(Booking);

  const approvalService = new ApprovalService(organizerRepo, eventRepo);
  const eventService = new EventService(eventRepo);
  const bookingService = new BookingService(bookingRepo);

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
  const attendee = await userRepo.findOne({
    where: { email: "ayesha.siddiqui@eventify.pk" },
  });

  assert(!!approvedOrgUser?.organizer, "Approved organizer missing");
  assert(!!pendingOrgUser?.organizer, "Pending organizer missing");
  assert(!!rejectedOrgUser?.organizer, "Rejected organizer missing");
  assert(!!attendee, "Attendee missing");

  const approvedGate = await approvalService.requireApprovedOrganizer(
    approvedOrgUser!.organizer!.id
  );
  assert(approvedGate.ok, "Approved organizer should pass gate");
  console.log("✓ Approved organizer passes gate");

  const pendingGate = await approvalService.requireApprovedOrganizer(
    pendingOrgUser!.organizer!.id
  );
  assert(pendingGate.ok === false && pendingGate.statusCode === 403, "Pending organizer should be blocked");
  if (pendingGate.ok === false) {
    console.log("✓ Pending organizer blocked:", pendingGate.message);
  }

  const rejectedGate = await approvalService.requireApprovedOrganizer(
    rejectedOrgUser!.organizer!.id
  );
  assert(rejectedGate.ok === false && rejectedGate.statusCode === 403, "Rejected organizer should be blocked");
  if (rejectedGate.ok === false) {
    console.log("✓ Rejected organizer blocked:", rejectedGate.message);
  }

  const publicEvents = await eventService.findAllPublic({}, 0, 100);
  assert(publicEvents.length > 0, "Public list should not be empty");
  assert(
    publicEvents.every(
      (e) =>
        e.status === VerificationStatus.APPROVED &&
        e.organizer?.verificationStatus === VerificationStatus.APPROVED
    ),
    "Public list must only contain approved events from approved organizers"
  );
  console.log("✓ Public event list has", publicEvents.length, "approved events");

  const approvedEvent = await eventRepo.findOne({
    where: { title: "Lahore Tech Summit 2026" },
    relations: ["organizer"],
  });
  const pendingEvent = await eventRepo.findOne({
    where: { title: "Multan Wellness & Health Fair" },
    relations: ["organizer"],
  });
  const rejectedEvent = await eventRepo.findOne({
    where: { title: "Lahore Classical Music Evening" },
    relations: ["organizer"],
  });

  assert(!!approvedEvent && !!pendingEvent && !!rejectedEvent, "Seed events missing");

  assert(ApprovalService.assertEventBookable(approvedEvent!).ok, "Approved event should be bookable");
  console.log("✓ Approved event is bookable");

  const pendingBookable = ApprovalService.assertEventBookable(pendingEvent!);
  assert(pendingBookable.ok === false, "Pending event should not be bookable");
  if (pendingBookable.ok === false) {
    console.log("✓ Pending event blocked:", pendingBookable.message);
  }

  const rejectedBookable = ApprovalService.assertEventBookable(rejectedEvent!);
  assert(rejectedBookable.ok === false, "Rejected event should not be bookable");
  if (rejectedBookable.ok === false) {
    console.log("✓ Rejected event blocked:", rejectedBookable.message);
  }

  const pendingBooking = await bookingService.createForAttendee({
    event: pendingEvent!,
    attendee: attendee!,
    quantity: 1,
  });
  assert(!pendingBooking.booking && pendingBooking.statusCode === 400, "Booking pending event should fail");
  console.log("✓ Booking on pending event blocked:", pendingBooking.error);

  const approvedBooking = await bookingService.createForAttendee({
    event: approvedEvent!,
    attendee: attendee!,
    quantity: 1,
  });
  assert(!!approvedBooking.booking, `Booking approved event should succeed: ${approvedBooking.error}`);
  console.log("✓ Booking on approved event created:", approvedBooking.booking!.id);

  const admin = await userRepo.findOne({ where: { email: "admin@eventify.pk" } });
  assert(!!admin, "Admin user missing");

  const remoderated = await eventService.updateEvent(approvedEvent!.id, {
    title: approvedEvent!.title,
  });
  assert(
    remoderated?.status === VerificationStatus.PENDING,
    "Editing approved event should return to pending"
  );
  console.log("✓ Approved event edit resets status to pending");

  await approvalService.approveEvent(approvedEvent!.id, admin!.id);
  const restored = await eventRepo.findOne({ where: { id: approvedEvent!.id } });
  assert(restored?.status === VerificationStatus.APPROVED, "Re-approve should restore event");
  console.log("✓ Admin re-approved event after edit");

  console.log("\nVERIFY APPROVAL: SUCCESS");
  await dataSource.destroy();
}

main().catch(async (err) => {
  console.error("VERIFY FAILED:", err);
  if (dataSource.isInitialized) await dataSource.destroy();
  process.exit(1);
});
