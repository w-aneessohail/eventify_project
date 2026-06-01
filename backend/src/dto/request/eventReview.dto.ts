import { IsNotEmpty, IsNumber, Length, Max, Min } from "class-validator";

export class CreateEventReviewDto {
  @IsNumber({}, { message: "Event ID must be a number" })
  eventId: number;

  @IsNumber({}, { message: "User ID must be a number" })
  userId: number;

  @IsNumber({}, { message: "Rating must be a number" })
  @Min(1, { message: "Minimum rating is 1" })
  @Max(5, { message: "Maximum rating is 5" })
  rating: number;

  @IsNotEmpty({ message: "Comment is required" })
  @Length(5, 200, { message: "Comment must be between 5 and 200 characters" })
  comment: string;
}
