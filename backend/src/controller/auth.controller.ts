import type { Request, Response } from "express";
import {
  authTokenRepository,
  organizerRepository,
  userRepository,
} from "../repository/index";
import Encrypt from "../helper/encrypt.helper";
import OtpTokens from "../helper/otp.helper";
import Mailer from "../helper/mailer.helper";
import { OtpPurpose } from "../enum/otpPurpose.enum";
import { UserRole } from "../enum/userRole.enum";
import { toSafeUser } from "../dto/response/user.response.dto";
import {
  getAccessTokenCookieOptions,
  getClearCookieOptions,
  getRefreshTokenCookieOptions,
} from "../helper/cookie.helper";
import { logger } from "../config/logger";

const ACCESS_TOKEN_KEY = "access_token";
const REFRESH_TOKEN_KEY = "refresh_token";

async function sendOtpEmail(
  to: string,
  subject: string,
  code: number
): Promise<void> {
  try {
    await Mailer.send({
      to,
      subject,
      html: `<p>Use this OTP to continue:</p><h2>${code}</h2><p>It expires in 10 minutes.</p>`,
    });
  } catch (err) {
    logger.warn({ err }, "Failed to send OTP email");
  }
}

export class AuthController {
  static async registerUser(req: Request, res: Response) {
    const { email, password, role, organizerDetails } = req.body;

    try {
      if (role === UserRole.ADMIN) {
        return res.status(403).json({
          message: "Admin accounts cannot be registered publicly",
        });
      }

      const existing = await userRepository.findByEmail(email);

      if (existing) {
        if (existing.isVerified) {
          return res
            .status(409)
            .json({ message: "User already exists and is verified" });
        } else {
          const issued = await OtpTokens.getOrCreateOtp({
            userId: existing.id,
            purpose: OtpPurpose.REGISTER,
          });

          if (!issued.throttled) {
            await sendOtpEmail(
              email,
              "Your Verification OTP",
              issued.code
            );
          }

          return res.status(200).json({
            message: issued.throttled
              ? "OTP already sent. Check your email or wait a minute before resending."
              : "Unverified account found. OTP sent to email.",
          });
        }
      }

      if (role === UserRole.ORGANIZER && !organizerDetails) {
        return res.status(400).json({
          message: "Organizer details are required when role is ORGANIZER",
        });
      }

      const user = await userRepository.createUser({
        ...req.body,
        password,
        isVerified: false,
      });

      if (role === UserRole.ORGANIZER && organizerDetails) {
        await organizerRepository.createOrganizer({
          ...(organizerDetails as Record<string, unknown>),
          user,
        });
      }

      const issued = await OtpTokens.getOrCreateOtp({
        userId: user.id,
        purpose: OtpPurpose.REGISTER,
      });

      if (!issued.throttled) {
        await sendOtpEmail(email, "Your Verification OTP", issued.code);
      }

      const userWithOrganizer = await userRepository.findById(user.id);

      return res.status(201).json({
        user: toSafeUser(userWithOrganizer ?? user),
        message: "User created successfully. OTP sent to email.",
      });
    } catch (error) {
      logger.error({ err: error }, "Error registering user");
      return res.status(500).json({ message: "Error registering user" });
    }
  }

  static async loginUser(req: Request, res: Response) {
    const { email, password } = req.body;
    const user = await userRepository.findByEmail(email);

    if (!user || !(await Encrypt.comparePassword(password, user.password))) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    if (!user.isVerified) {
      return res.status(403).json({ message: "Email not verified" });
    }

    const token = await Encrypt.generateToken({ id: user.id });
    const refreshToken = await Encrypt.generateRefreshToken({ id: user.id });

    await authTokenRepository.revokeUserTokens(user.id);

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await authTokenRepository.createAuthToken({
      user,
      refreshToken,
      expiresAt,
    });

    res.cookie("access_token", token, getAccessTokenCookieOptions());
    res.cookie("refresh_token", refreshToken, getRefreshTokenCookieOptions());

    const userWithOrganizer = await userRepository.findByEmail(email);

    res
      .status(200)
      .json({ user: toSafeUser(userWithOrganizer ?? user), message: "Login successful" });
  }

  static async refreshToken(req: Request, res: Response) {
    const refreshToken =
      req.cookies.refresh_token || req.body.refreshToken || "";

    if (!refreshToken) {
      return res.status(400).json({ message: "Refresh token is required" });
    }

    try {
      const storedToken = await authTokenRepository.findByToken(refreshToken);

      if (!storedToken || storedToken.isRevoked) {
        return res
          .status(401)
          .json({ message: "Invalid or revoked refresh token" });
      }

      if (new Date(storedToken.expiresAt) < new Date()) {
        await authTokenRepository.revokeToken(storedToken.id);
        return res.status(401).json({ message: "Refresh token expired" });
      }

      const payload = Encrypt.verifyToken(refreshToken);
      if (!payload) {
        return res
          .status(401)
          .json({ message: "Invalid refresh token signature" });
      }

      await authTokenRepository.revokeToken(storedToken.id);

      const newAccessToken = await Encrypt.generateToken({ id: payload.id });
      const newRefreshToken = await Encrypt.generateRefreshToken({
        id: payload.id,
      });

      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      await authTokenRepository.createAuthToken({
        user: storedToken.user,
        refreshToken: newRefreshToken,
        expiresAt,
      });

      res.cookie("access_token", newAccessToken, getAccessTokenCookieOptions());
      res.cookie("refresh_token", newRefreshToken, getRefreshTokenCookieOptions());

      return res.status(200).json({
        message: "Tokens refreshed successfully",
      });
    } catch (error) {
      logger.error({ err: error }, "Error refreshing token");
      return res
        .status(500)
        .json({ message: "Server error during token refresh" });
    }
  }

  static async verifyOtp(req: Request, res: Response) {
    const { email, otp } = req.body || {};
    if (!email || !otp) {
      return res.status(400).json({ message: "email and otp are required" });
    }

    const user = await userRepository.findByEmail(email);
    if (!user) return res.status(404).json({ message: "User not found" });

    const done = await OtpTokens.verifyAndConsume({
      userId: user.id,
      purpose: OtpPurpose.REGISTER,
      code: Number(otp),
    });
    if (!done)
      return res.status(400).json({ message: "Invalid or expired OTP" });

    await userRepository.updateUser(user.id, { isVerified: true });

    const verifiedUser = await userRepository.findById(user.id);

    return res.status(200).json({
      user: toSafeUser(verifiedUser ?? user),
      message: "Email verified successfully",
    });
  }

  static async validateResetOtp(req: Request, res: Response) {
    const { email, otp } = req.body || {};
    if (!email || !otp) {
      return res.status(400).json({ message: "email and otp are required" });
    }

    const user = await userRepository.findByEmail(email);
    if (!user) return res.status(404).json({ message: "User not found" });

    const valid = await OtpTokens.verifyOnly({
      userId: user.id,
      purpose: OtpPurpose.RESET_PASSWORD,
      code: Number(otp),
    });

    if (!valid) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    return res.status(200).json({ message: "OTP is valid" });
  }

  static async forgotPassword(req: Request, res: Response) {
    const { email } = req.body || {};
    if (!email) return res.status(400).json({ message: "email is required" });

    const user = await userRepository.findByEmail(email);
    if (!user) return res.status(404).json({ message: "User not found" });

    const issued = await OtpTokens.getOrCreateOtp({
      userId: user.id,
      purpose: OtpPurpose.RESET_PASSWORD,
    });

    if (issued.throttled) {
      return res.status(200).json({
        message:
          "If an OTP was recently sent, please check your email or wait a minute before resending.",
      });
    }

    await sendOtpEmail(user.email, "Your Password Reset OTP", issued.code);

    return res.status(200).json({ message: "Reset OTP sent to email" });
  }

  static async resendOtp(req: Request, res: Response) {
    const { email, purpose } = req.body || {};
    if (!email || !purpose) {
      return res.status(400).json({ message: "email and purpose are required" });
    }

    const user = await userRepository.findByEmail(email);
    if (!user) return res.status(404).json({ message: "User not found" });

    const otpPurpose =
      purpose === OtpPurpose.RESET_PASSWORD || purpose === "reset_password"
        ? OtpPurpose.RESET_PASSWORD
        : OtpPurpose.REGISTER;

    if (otpPurpose === OtpPurpose.REGISTER && user.isVerified) {
      return res.status(400).json({ message: "Account is already verified" });
    }

    const issued = await OtpTokens.getOrCreateOtp({
      userId: user.id,
      purpose: otpPurpose,
    });

    if (issued.throttled) {
      return res.status(429).json({
        message: "Please wait a minute before requesting another OTP.",
      });
    }

    const subject =
      otpPurpose === OtpPurpose.RESET_PASSWORD
        ? "Your Password Reset OTP"
        : "Your Verification OTP";
    await sendOtpEmail(user.email, subject, issued.code);

    return res.status(200).json({ message: "OTP sent to email" });
  }

  static async resetPassword(req: Request, res: Response) {
    const { email, otp, newPassword } = req.body || {};
    if (!email || !otp || !newPassword) {
      return res
        .status(400)
        .json({ message: "email, otp and newPassword are required" });
    }

    const user = await userRepository.findByEmail(email);
    if (!user) return res.status(404).json({ message: "User not found" });

    const done = await OtpTokens.verifyAndConsume({
      userId: user.id,
      purpose: OtpPurpose.RESET_PASSWORD,
      code: Number(otp),
    });
    if (!done)
      return res.status(400).json({ message: "Invalid or expired OTP" });

    await userRepository.updateUser(user.id, { password: newPassword });

    return res.status(200).json({ message: "Password reset successful" });
  }

  static async logoutUser(req: Request, res: Response) {
    res.clearCookie(ACCESS_TOKEN_KEY, getClearCookieOptions());
    res.clearCookie(REFRESH_TOKEN_KEY, getClearCookieOptions());
    res.status(200).json({ message: "Logged out successfully" });
  }
}
