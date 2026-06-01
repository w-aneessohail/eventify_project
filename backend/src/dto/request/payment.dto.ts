import {
  IsNumber,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  IsString,
} from "class-validator";
import { PaymentMethod } from "../../enum/paymentMethod.enum";
import { PaymentStatus } from "../../enum/paymentStatus.enum";

export class CreatePaymentDto {
  @IsNumber({}, { message: "Booking ID must be a number" })
  bookingId: number;

  @IsNumber({}, { message: "Amount must be a number" })
  amount: number;

  @IsEnum(PaymentMethod, { message: "Invalid payment method" })
  method: PaymentMethod;

  @IsString()
  @IsNotEmpty({ message: "Transaction ID is required" })
  transactionId: string;

  @IsEnum(PaymentStatus, { message: "Invalid payment status" })
  @IsOptional()
  status?: PaymentStatus;
}
