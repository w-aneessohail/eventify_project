import { IsNumber, IsNotEmpty, IsEnum } from "class-validator";

export enum PaymentStatus {
  PENDING = "pending",
  COMPLETED = "completed",
  FAILED = "failed",
}

export class CreatePaymentDto {
  @IsNumber({}, { message: "Booking ID must be a number" })
  bookingId: number;

  @IsNumber({}, { message: "Amount must be a number" })
  amount: number;

  @IsEnum(PaymentStatus, { message: "Invalid payment status" })
  status: PaymentStatus;
}
