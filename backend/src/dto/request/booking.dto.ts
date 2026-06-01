import { IsNumber, IsEnum, IsOptional } from "class-validator";
import { PaymentStatus } from "../../enum/paymentStatus.enum";

export class CreateBookingDto {
  @IsNumber({}, { message: "Event ID must be a number" })
  eventId: number;

  @IsNumber({}, { message: "Attendee ID must be a number" })
  attendeeId: number;

  @IsNumber({}, { message: "Quantity must be a number" })
  quantity: number;

  @IsNumber({}, { message: "Total amount must be a number" })
  totalAmount: number;

  @IsEnum(PaymentStatus, { message: "Invalid booking status" })
  @IsOptional()
  status?: PaymentStatus;
}

export class UpdateBookingDto {
  @IsOptional()
  @IsNumber({}, { message: "Quantity must be a number" })
  quantity?: number;

  @IsOptional()
  @IsNumber({}, { message: "Total amount must be a number" })
  totalAmount?: number;

  @IsOptional()
  @IsEnum(PaymentStatus, { message: "Invalid booking status" })
  status?: PaymentStatus;
}
