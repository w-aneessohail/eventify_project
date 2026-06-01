import { IsEmail, IsNotEmpty, Length } from "class-validator";

export class LoginDto {
  @IsEmail({}, { message: "Invalid email format" })
  email: string;

  @IsNotEmpty({ message: "Password is required" })
  password: string;
}

export class RegisterDto {
  @IsEmail({}, { message: "Invalid email format" })
  email: string;

  @IsNotEmpty({ message: "Password is required" })
  @Length(8, 30, { message: "Password must be between 8 and 30 characters" })
  password: string;

  @IsNotEmpty({ message: "Name is required" })
  name: string;
}

export class VerifyOtpDto {
  @IsEmail({}, { message: "Invalid email format" })
  email: string;

  @IsNotEmpty({ message: "OTP is required" })
  otp: string;
}

export class ResetPasswordDto {
  @IsEmail({}, { message: "Invalid email format" })
  email: string;

  @IsNotEmpty({ message: "OTP is required" })
  otp: string;

  @IsNotEmpty({ message: "New password is required" })
  newPassword: string;
}
