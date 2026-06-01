export class OtpTokenResponseDto {
  id: number;
  userId: number;
  code: string;
  purpose: string;
  isUsed: boolean;
  createdAt: string;

  constructor(otp: any) {
    this.id = otp.id;
    this.userId = otp.userId;
    this.code = otp.code;
    this.purpose = otp.purpose;
    this.isUsed = otp.isUsed;
    this.createdAt = otp.createdAt;
  }
}
