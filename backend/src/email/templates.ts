type EmailLayoutParams = {
  title: string;
  body: string;
};

function emailLayout({ title, body }: EmailLayoutParams): string {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>${title}</title></head>
<body style="font-family: Arial, sans-serif; line-height: 1.5; color: #222; max-width: 600px; margin: 0 auto; padding: 16px;">
  <h2 style="color: #0369a1;">Eventify</h2>
  <h3>${title}</h3>
  ${body}
  <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
  <p style="font-size: 12px; color: #666;">This is an automated message from Eventify. Please do not reply.</p>
</body>
</html>`.trim();
}

export function organizerStatusTemplate(params: {
  organizerName: string;
  organizationName: string;
  status: "approved" | "rejected";
  rejectionReason?: string | null;
}): string {
  const approved = params.status === "approved";
  const title = approved
    ? "Organizer account approved"
    : "Organizer account not approved";
  const message = approved
    ? "Your organizer account has been approved. You can now create and manage events on Eventify."
    : "Your organizer account was not approved at this time. Contact support if you have questions.";
  const reasonRow =
    !approved && params.rejectionReason
      ? `<tr><td style="padding: 4px 12px 4px 0; color: #666;">Reason</td><td>${params.rejectionReason}</td></tr>`
      : "";

  return emailLayout({
    title,
    body: `
      <p>Hello <strong>${params.organizerName}</strong>,</p>
      <p>${message}</p>
      <table style="margin: 16px 0; border-collapse: collapse;">
        <tr><td style="padding: 4px 12px 4px 0; color: #666;">Organization</td><td><strong>${params.organizationName}</strong></td></tr>
        <tr><td style="padding: 4px 12px 4px 0; color: #666;">Status</td><td><strong>${params.status}</strong></td></tr>
        ${reasonRow}
      </table>
    `,
  });
}

export function eventStatusTemplate(params: {
  eventTitle: string;
  status: "approved" | "rejected";
  rejectionReason?: string | null;
}): string {
  const approved = params.status === "approved";
  const title = approved ? "Event approved" : "Event not approved";
  const message = approved
    ? "Your event has been approved and is now visible to attendees on Eventify."
    : "Your event was not approved at this time. You may edit and resubmit for review.";
  const reasonRow =
    !approved && params.rejectionReason
      ? `<tr><td style="padding: 4px 12px 4px 0; color: #666;">Reason</td><td>${params.rejectionReason}</td></tr>`
      : "";

  return emailLayout({
    title,
    body: `
      <p>${message}</p>
      <table style="margin: 16px 0; border-collapse: collapse;">
        <tr><td style="padding: 4px 12px 4px 0; color: #666;">Event</td><td><strong>${params.eventTitle}</strong></td></tr>
        <tr><td style="padding: 4px 12px 4px 0; color: #666;">Status</td><td><strong>${params.status}</strong></td></tr>
        ${reasonRow}
      </table>
    `,
  });
}

export function bookingConfirmationTemplate(params: {
  attendeeName: string;
  eventTitle: string;
  quantity: number;
  amount: number;
  bookingStatus: string;
  paymentStatus: string;
  bookingId: number;
}): string {
  const formattedAmount = Number(params.amount).toLocaleString("en-PK", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });

  return emailLayout({
    title: "Booking confirmed",
    body: `
      <p>Hello <strong>${params.attendeeName}</strong>,</p>
      <p>Thank you for your booking. Your payment was successful.</p>
      <table style="margin: 16px 0; border-collapse: collapse;">
        <tr><td style="padding: 4px 12px 4px 0; color: #666;">Booking ID</td><td><strong>#${params.bookingId}</strong></td></tr>
        <tr><td style="padding: 4px 12px 4px 0; color: #666;">Event</td><td><strong>${params.eventTitle}</strong></td></tr>
        <tr><td style="padding: 4px 12px 4px 0; color: #666;">Tickets</td><td><strong>${params.quantity}</strong></td></tr>
        <tr><td style="padding: 4px 12px 4px 0; color: #666;">Amount paid</td><td><strong>PKR ${formattedAmount}</strong></td></tr>
        <tr><td style="padding: 4px 12px 4px 0; color: #666;">Booking status</td><td><strong>${params.bookingStatus}</strong></td></tr>
        <tr><td style="padding: 4px 12px 4px 0; color: #666;">Payment status</td><td><strong>${params.paymentStatus}</strong></td></tr>
      </table>
      <p>We look forward to seeing you at the event.</p>
    `,
  });
}
