import { Repository, LessThan } from "typeorm";
import { OtpToken } from "../entity/otpToken.entity";
import { OtpPurpose } from "../enum/otpPurpose.enum";
import { User } from "../entity/user.entity";

export class OtpTokenService {
  constructor(private otpRepository: Repository<OtpToken>) {}

  async findAll(): Promise<OtpToken[]> {
    return this.otpRepository.find({
      relations: ["user"],
    });
  }

  async findById(id: number): Promise<OtpToken | null> {
    return this.otpRepository.findOne({
      where: { id },
      relations: ["user"],
    });
  }

  async findByUser(userId: number): Promise<OtpToken[]> {
    return this.otpRepository.find({
      where: { user: { id: userId } },
      relations: ["user"],
    });
  }

  async createOtpToken(
    user: User,
    purpose: OtpPurpose,
    otpCode: number,
    expiresAt: Date
  ): Promise<OtpToken> {
    const otp = this.otpRepository.create({
      user,
      purpose,
      otpCode,
      expiresAt,
      consumedAt: null,
    });

    return this.otpRepository.save(otp);
  }

  async consumeOtp(id: number): Promise<OtpToken | null> {
    const otp = await this.otpRepository.findOneBy({ id });
    if (!otp) return null;

    otp.consumedAt = new Date();
    return this.otpRepository.save(otp);
  }

  async deleteExpiredOtps(): Promise<void> {
    await this.otpRepository.delete({
      expiresAt: LessThan(new Date()),
    });
  }

  async deleteByUser(userId: number): Promise<void> {
    await this.otpRepository.delete({
      user: { id: userId },
    });
  }
}
