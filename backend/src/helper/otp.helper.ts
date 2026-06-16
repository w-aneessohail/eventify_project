import { IsNull, MoreThan } from "typeorm";
import { AppDataSource } from "../config/dataSource.config";
import { OtpToken } from "../entity/otpToken.entity";
import { User } from "../entity/user.entity";
import { OtpPurpose } from "../enum/otpPurpose.enum";
import { otpTokenRepository } from "../repository";

export type OtpIssueResult = {
  code: number;
  created: boolean;
  throttled: boolean;
};

const DEFAULT_TTL_MINUTES = 10;
const MIN_RESEND_INTERVAL_SECONDS = 60;

export default class OtpTokens {
  static generateOtp() {
    return Math.floor(100000 + Math.random() * 900000);
  }

  static async getOrCreateOtp(params: {
    userId: number;
    purpose: OtpPurpose;
    ttlMinutes?: number;
    minResendIntervalSeconds?: number;
  }): Promise<OtpIssueResult> {
    const {
      userId,
      purpose,
      ttlMinutes = DEFAULT_TTL_MINUTES,
      minResendIntervalSeconds = MIN_RESEND_INTERVAL_SECONDS,
    } = params;

    const repo = AppDataSource.getRepository(OtpToken);
    const existing = await repo.findOne({
      where: {
        user: { id: userId },
        purpose,
        consumedAt: IsNull(),
        expiresAt: MoreThan(new Date()),
      },
      order: { createdAt: "DESC" },
    });

    if (existing) {
      const ageSec = (Date.now() - existing.createdAt.getTime()) / 1000;
      return {
        code: existing.otpCode,
        created: false,
        throttled: ageSec < minResendIntervalSeconds,
      };
    }

    const code = this.generateOtp();
    await this.setOtp({ userId, purpose, code, ttlMinutes });
    return { code, created: true, throttled: false };
  }

  static async setOtp(params: {
    userId: number;
    purpose: OtpPurpose;
    code: number;
    ttlMinutes?: number;
  }) {
    const { userId, purpose, code, ttlMinutes = DEFAULT_TTL_MINUTES } = params;
    const userRepo = AppDataSource.getRepository(User);

    const user = await userRepo.findOneBy({ id: userId });
    if (!user) throw new Error("User not found for OTP");

    return otpTokenRepository.createOtpToken(
      user,
      purpose,
      code,
      new Date(Date.now() + ttlMinutes * 60 * 1000)
    );
  }

  static async verifyAndConsume(params: {
    userId: number;
    purpose: OtpPurpose;
    code: number;
  }) {
    const { userId, purpose, code } = params;
    const repo = AppDataSource.getRepository(OtpToken);

    const gotUser = await repo.findOne({
      where: { purpose, otpCode: code, user: { id: userId }, consumedAt: IsNull() },
      relations: ["user"],
    });

    if (!gotUser) return false;
    if (gotUser.expiresAt.getTime() < Date.now()) return false;

    gotUser.consumedAt = new Date();
    await repo.save(gotUser);
    return true;
  }

  /** Validate OTP without consuming — used before navigating to reset-password. */
  static async verifyOnly(params: {
    userId: number;
    purpose: OtpPurpose;
    code: number;
  }): Promise<boolean> {
    const { userId, purpose, code } = params;
    const repo = AppDataSource.getRepository(OtpToken);

    const token = await repo.findOne({
      where: { purpose, otpCode: code, user: { id: userId }, consumedAt: IsNull() },
    });

    if (!token) return false;
    if (token.expiresAt.getTime() < Date.now()) return false;
    return true;
  }
}
