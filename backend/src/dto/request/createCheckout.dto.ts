import { IsNumber } from "class-validator";

/** Attendee initiates Safepay hosted checkout for a pending booking. */
export class CreateCheckoutDto {
  @IsNumber({}, { message: "Booking ID must be a number" })
  bookingId: number;
}
