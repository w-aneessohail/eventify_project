import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  Length,
} from "class-validator";

export enum EventStatus {
  PENDING = "pending",
  APPROVED = "approved",
  COMPLETED = "completed",
}

export class CreateEventDto {
  @IsNotEmpty({ message: "Title is required" })
  @Length(3, 100, { message: "Title must be between 3 and 100 characters" })
  title: string;

  @IsNotEmpty({ message: "Description is required" })
  description: string;

  @IsNotEmpty({ message: "Address is required" })
  address: string;

  @IsDateString({}, { message: "Invalid event date format" })
  eventDate: string;

  @IsNumber({}, { message: "Ticket price must be a number" })
  ticketPrice: number;

  @IsNumber({}, { message: "Total tickets must be a number" })
  totalTickets: number;

  @IsEnum(EventStatus, { message: "Invalid event status" })
  @IsOptional()
  status?: EventStatus;
}

export class UpdateEventDto {
  @IsOptional() title?: string;
  @IsOptional() description?: string;
  @IsOptional() address?: string;
  @IsOptional() eventDate?: string;
  @IsOptional() ticketPrice?: number;
  @IsOptional() totalTickets?: number;
  @IsOptional() status?: EventStatus;
}
