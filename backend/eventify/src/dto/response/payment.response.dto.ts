export class PaymentResponseDto {
  id: number;
  bookingId: number;
  amount: number;
  status: string;
  createdAt: string;

  constructor(payment: any) {
    this.id = payment.id;
    this.bookingId = payment.bookingId;
    this.amount = payment.amount;
    this.status = payment.status;
    this.createdAt = payment.createdAt;
  }
}
