import { IsNotEmpty, Length } from "class-validator";

export class CreateCategoryDto {
  @IsNotEmpty({ message: "Category name is required" })
  @Length(3, 50, {
    message: "Category name must be between 3 and 50 characters",
  })
  name: string;
}
