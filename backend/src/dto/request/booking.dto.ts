import { IsNumber, IsEnum, IsOptional, Min } from "class-validator";
import { BookingStatus } from "../../enum/bookingStatus.enum";

export class CreateBookingDto {
  @IsNumber({}, { message: "Event ID must be a number" })
  eventId: number;

  @IsNumber({}, { message: "Quantity must be a number" })
  @Min(1, { message: "Quantity must be at least 1" })
  quantity: number;
}

export class UpdateBookingDto {
  @IsOptional()
  @IsNumber({}, { message: "Quantity must be a number" })
  quantity?: number;

  @IsOptional()
  @IsEnum(BookingStatus, { message: "Invalid booking status" })
  status?: BookingStatus;
}
