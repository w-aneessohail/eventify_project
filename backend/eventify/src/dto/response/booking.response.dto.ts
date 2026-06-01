export class BookingResponseDto {
  id: number;
  ticketCount: number;
  totalAmount: number;
  status: string;
  event?: any; // Event relation data
  attendee?: any; // Attendee (User) relation data
  payments?: any[]; // Related payments
  createdAt: string;
  updatedAt: string;

  constructor(booking: any) {
    this.id = booking.id;
    this.ticketCount = booking.ticketCount;
    this.totalAmount = booking.totalAmount;
    this.status = booking.status ?? "pending";
    this.event = booking.event ?? null;
    this.attendee = booking.attendee ?? null;
    this.payments = booking.payments ?? [];
    this.createdAt = booking.createdAt;
    this.updatedAt = booking.updatedAt;
  }
}
