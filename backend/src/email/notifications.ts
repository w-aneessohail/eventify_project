import type { Booking } from "../entity/booking.entity";
import type { Event } from "../entity/event.entity";
import type { Organizer } from "../entity/organizer.entity";
import type { Payment } from "../entity/payment.entity";
import { MailService } from "../service/mail.service";
import {
  bookingConfirmationTemplate,
  eventStatusTemplate,
  organizerStatusTemplate,
} from "./templates";

function organizerEmail(organizer: Organizer): string | null {
  return organizer.user?.email?.trim() || null;
}

export async function notifyOrganizerApproved(
  organizer: Organizer
): Promise<void> {
  const to = organizerEmail(organizer);
  if (!to) return;

  await MailService.sendSafe({
    to,
    subject: "Eventify — Your organizer account has been approved",
    html: organizerStatusTemplate({
      organizerName: organizer.organizerName,
      organizationName: organizer.organizationName,
      status: "approved",
    }),
  });
}

export async function notifyOrganizerRejected(
  organizer: Organizer
): Promise<void> {
  const to = organizerEmail(organizer);
  if (!to) return;

  await MailService.sendSafe({
    to,
    subject: "Eventify — Organizer account update",
    html: organizerStatusTemplate({
      organizerName: organizer.organizerName,
      organizationName: organizer.organizationName,
      status: "rejected",
    }),
  });
}

export async function notifyEventApproved(event: Event): Promise<void> {
  const to = event.organizer?.user?.email?.trim();
  if (!to) return;

  await MailService.sendSafe({
    to,
    subject: `Eventify — "${event.title}" has been approved`,
    html: eventStatusTemplate({
      eventTitle: event.title,
      status: "approved",
    }),
  });
}

export async function notifyEventRejected(event: Event): Promise<void> {
  const to = event.organizer?.user?.email?.trim();
  if (!to) return;

  await MailService.sendSafe({
    to,
    subject: `Eventify — "${event.title}" was not approved`,
    html: eventStatusTemplate({
      eventTitle: event.title,
      status: "rejected",
    }),
  });
}

export async function notifyBookingConfirmed(
  booking: Booking,
  payment: Payment
): Promise<void> {
  const to = booking.attendee?.email?.trim();
  if (!to) return;

  await MailService.sendSafe({
    to,
    subject: `Eventify — Booking confirmed for ${booking.event?.title ?? "your event"}`,
    html: bookingConfirmationTemplate({
      attendeeName: booking.attendee?.name ?? "Guest",
      eventTitle: booking.event?.title ?? "Event",
      quantity: booking.quantity,
      amount: Number(booking.totalAmount),
      bookingStatus: String(booking.status),
      paymentStatus: String(payment.status),
      bookingId: booking.id,
    }),
  });
}
