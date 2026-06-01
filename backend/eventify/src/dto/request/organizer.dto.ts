import { IsNotEmpty, IsOptional, Length, IsPhoneNumber } from "class-validator";

export class CreateOrganizerDto {
  @IsNotEmpty({ message: "Organization name is required" })
  @Length(3, 100, {
    message: "Organization name must be between 3 and 100 characters",
  })
  organizationName: string;

  @IsNotEmpty({ message: "CNIC is required" })
  @Length(13, 15, { message: "CNIC must be valid" })
  cnic: string;

  @IsNotEmpty({ message: "Contact number is required" })
  @IsPhoneNumber(null, { message: "Invalid phone number" })
  phone: string;

  @IsNotEmpty({ message: "Address is required" })
  @Length(5, 200, { message: "Address must be between 5 and 200 characters" })
  address: string;
}

export class UpdateOrganizerDto {
  @IsOptional()
  @Length(3, 100, {
    message: "Organization name must be between 3 and 100 characters",
  })
  organizationName?: string;

  @IsOptional()
  @Length(13, 15, { message: "CNIC must be valid" })
  cnic?: string;

  @IsOptional()
  @IsPhoneNumber(null, { message: "Invalid phone number" })
  phone?: string;

  @IsOptional()
  @Length(5, 200, { message: "Address must be between 5 and 200 characters" })
  address?: string;
}
