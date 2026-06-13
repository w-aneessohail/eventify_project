import { IsNumber, IsEnum } from "class-validator";
import { PaymentMethod } from "../../enum/paymentMethod.enum";

/** Attendee initiates payment for an existing pending booking. */
export class ConfirmPaymentDto {
  @IsNumber({}, { message: "Booking ID must be a number" })
  bookingId: number;

  @IsEnum(PaymentMethod, { message: "Invalid payment method" })
  method: PaymentMethod;
}
