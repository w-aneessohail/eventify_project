import { AppDataSource } from "../config/dataSource.config";
import { OtpToken } from "../entity/otpToken.entity";
import { User } from "../entity/user.entity";
import { OtpPurpose } from "../enum/otpPurpose.enum";
import { otpTokenRepository } from "../repository";

export default class OtpTokens {
  static generateOtp() {
    return Math.floor(100000 + Math.random() * 900000);
  }

  static async setOtp(params: {
    userId: number;
    purpose: OtpPurpose;
    code: number;
    ttlMinutes?: number;
  }) {
    const { userId, purpose, code, ttlMinutes = 10 } = params;
    const userRepo = AppDataSource.getRepository(User);

    const user = await userRepo.findOneBy({ id: userId });
    if (!user) throw new Error("User not found for OTP");

    const repo = await otpTokenRepository.createOtpToken(
      user,
      purpose,
      code,
      new Date(Date.now() + ttlMinutes * 60 * 1000)
    );

    return repo;
  }

  static async verifyAndConsume(params: {
    userId: number;
    purpose: OtpPurpose;
    code: number;
  }) {
    const { userId, purpose, code } = params;
    const repo = AppDataSource.getRepository(OtpToken);

    const gotUser = await repo.findOne({
      where: { purpose, otpCode: code, user: { id: userId }, consumedAt: null },
      relations: ["user"],
    });

    if (!gotUser) return false;
    if (gotUser.expiresAt.getTime() < Date.now()) return false;

    gotUser.consumedAt = new Date();
    await repo.save(gotUser);
    return true;
  }
}
