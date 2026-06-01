import { IsNotEmpty } from "class-validator";

export class CreateAuthTokenDto {
  @IsNotEmpty({ message: "Refresh token is required" })
  refreshToken: string;

  @IsNotEmpty({ message: "Expiry date is required" })
  expiresAt: Date;
}
