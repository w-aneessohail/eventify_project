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

const ACCESS_TOKEN_KEY = "access_token";
const REFRESH_TOKEN_KEY = "refresh_token";

export class AuthController {
  static async registerUser(req: Request, res: Response) {
    const { email, password, role, organizerDetails } = req.body;

    try {
      const existing = await userRepository.findByEmail(email);

      if (existing) {
        if (existing.isVerified) {
          return res
            .status(409)
            .json({ message: "User already exists and is verified" });
        } else {
          const otp = OtpTokens.generateOtp();
          await OtpTokens.setOtp({
            userId: existing.id,
            purpose: OtpPurpose.REGISTER,
            code: otp,
          });

          try {
            await Mailer.send({
              to: email,
              subject: "Your Verification OTP",
              html: `<p>Use this OTP to verify your account:</p><h2>${otp}</h2><p>It expires in 10 minutes.</p>`,
            });
          } catch (err) {
            console.log("Failed to send OTP:", (err as Error).message);
          }

          return res.status(200).json({
            message: "Unverified account found. OTP sent to email.",
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
          ...organizerDetails,
          user,
        });
      }

      const otp = OtpTokens.generateOtp();
      await OtpTokens.setOtp({
        userId: user.id,
        purpose: OtpPurpose.REGISTER,
        code: otp,
      });

      try {
        await Mailer.send({
          to: email,
          subject: "Your Verification OTP",
          html: `<p>Use this OTP to verify your account:</p><h2>${otp}</h2><p>It expires in 10 minutes.</p>`,
        });
      } catch (err) {
        console.log("Failed to send OTP:", (err as Error).message);
      }

      return res.status(201).json({
        user,
        message: "User created successfully. OTP sent to email.",
      });
    } catch (error) {
      console.error("Error registering user:", error);
      return res.status(500).json({ message: "Error registering user" });
    }
  }

  static async loginUser(req: Request, res: Response) {
    const { email, password } = req.body;
    const user = await userRepository.findByEmail(email);

    if (!user || !(await Encrypt.comparePassword(password, user.password))) {
      return res.status(401).json({ message: "Invalid credentials" });
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

    res.cookie("access_token", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: false,
      maxAge: 24 * 60 * 60 * 1000,
    });
    res.cookie("refresh_token", refreshToken, {
      httpOnly: true,
      sameSite: "lax",
      secure: false,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({ user, message: "Login successful" });
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

      // ✅ Refresh cookies
      res.cookie("access_token", newAccessToken, {
        httpOnly: true,
        sameSite: "lax",
        secure: false,
        maxAge: 24 * 60 * 60 * 1000,
      });
      res.cookie("refresh_token", newRefreshToken, {
        httpOnly: true,
        sameSite: "lax",
        secure: false,
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      return res.status(200).json({
        message: "Tokens refreshed successfully",
      });
    } catch (error) {
      console.error("Error refreshing token:", error);
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
      code: otp,
    });
    if (!done)
      return res.status(400).json({ message: "Invalid or expired OTP" });

    await userRepository.updateUser(user.id, { isVerified: true });

    return res.status(200).json({
      user,
      message: "Email verified successfully",
    });
  }

  static async forgotPassword(req: Request, res: Response) {
    const { email } = req.body || {};
    if (!email) return res.status(400).json({ message: "email is required" });

    const user = await userRepository.findByEmail(email);
    if (!user) return res.status(404).json({ message: "User not found" });

    const otp = OtpTokens.generateOtp();
    await OtpTokens.setOtp({
      userId: user.id,
      purpose: OtpPurpose.RESET_PASSWORD,
      code: otp,
    });

    try {
      await Mailer.send({
        to: email,
        subject: "Your Password Reset OTP",
        html: `<p>Use this OTP to reset your password:</p><h2>${otp}</h2><p>It expires in 10 minutes.</p>`,
      });
    } catch (err) {
      console.log("Failed to send reset OTP:", (err as Error).message);
    }

    return res.status(200).json({ message: "Reset OTP sent to email" });
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
      code: otp,
    });
    if (!done)
      return res.status(400).json({ message: "Invalid or expired OTP" });

    await userRepository.updateUser(user.id, { password: newPassword });

    return res.status(200).json({ message: "Password reset successful" });
  }

  static async logoutUser(req: Request, res: Response) {
    res.clearCookie(ACCESS_TOKEN_KEY);
    res.clearCookie(REFRESH_TOKEN_KEY);
    res.status(200).json({ message: "Logged out successfully" });
  }
}
