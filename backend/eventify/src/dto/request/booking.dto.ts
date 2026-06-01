import { IsNumber, IsEnum, IsOptional } from "class-validator";

export enum BookingStatus {
  PENDING = "pending",
  CONFIRMED = "confirmed",
  CANCELLED = "cancelled",
}

export class CreateBookingDto {
  @IsNumber({}, { message: "Event ID must be a number" })
  eventId: number;

  @IsNumber({}, { message: "Attendee ID must be a number" })
  attendeeId: number;

  @IsNumber({}, { message: "Ticket count must be a number" })
  ticketCount: number;

  @IsNumber({}, { message: "Total amount must be a number" })
  totalAmount: number;

  @IsEnum(BookingStatus, { message: "Invalid booking status" })
  @IsOptional()
  status?: BookingStatus;
}

export class UpdateBookingDto {
  @IsOptional()
  @IsNumber({}, { message: "Ticket count must be a number" })
  ticketCount?: number;

  @IsOptional()
  @IsNumber({}, { message: "Total amount must be a number" })
  totalAmount?: number;

  @IsOptional()
  @IsEnum(BookingStatus, { message: "Invalid booking status" })
  status?: BookingStatus;
}
