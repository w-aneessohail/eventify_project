import { IsEnum, IsNotEmpty, Length } from "class-validator";
import { OtpPurpose } from "../../enum/otpPurpose.enum";

export class CreateOtpTokenDto {
  @IsEnum(OtpPurpose, { message: "Invalid OTP purpose" })
  purpose: OtpPurpose;

  @IsNotEmpty({ message: "OTP code is required" })
  @Length(6, 6, { message: "OTP code must be 6 digits" })
  code: string;
}
