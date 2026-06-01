import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  Length,
} from "class-validator";
import { UserRole } from "../../enum/userRole.enum";

export class CreateUserDto {
  @IsNotEmpty({ message: "Name is required" })
  @Length(3, 50, { message: "Name must be between 3 and 50 characters" })
  name: string;

  @IsEmail({}, { message: "Invalid email format" })
  email: string;

  @IsNotEmpty({ message: "Password is required" })
  @Length(8, 30, { message: "Password must be between 8 and 30 characters" })
  password: string;

  @IsOptional()
  profileImage?: string;

  @IsEnum(UserRole, { message: "Invalid user role" })
  role: UserRole;
}

export class UpdateUserDto {
  @IsOptional()
  @Length(3, 50, { message: "Name must be between 3 and 50 characters" })
  name?: string;

  @IsOptional()
  @IsEmail({}, { message: "Invalid email format" })
  email?: string;

  @IsOptional()
  profileImage?: string;

  @IsOptional()
  @IsEnum(UserRole, { message: "Invalid user role" })
  role?: UserRole;
}
