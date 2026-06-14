import * as jwt from "jsonwebtoken";
import * as bcrypt from "bcrypt";
import { getConfig } from "../config/env";
import { logger } from "../config/logger";

export default class Encrypt {
  static async comparePassword(
    password: string,
    hashedPassword: string
  ): Promise<boolean> {
    return bcrypt.compareSync(password, hashedPassword);
  }

  static async generateToken(payload: { id: number }): Promise<string> {
    return jwt.sign(payload, getConfig().jwtSecret, { expiresIn: "1h" });
  }

  static async generateRefreshToken(payload: { id: number }): Promise<string> {
    return jwt.sign(payload, getConfig().jwtSecret, { expiresIn: "7d" });
  }

  static verifyToken(token: string): { id: number } | null {
    try {
      return jwt.verify(token, getConfig().jwtSecret) as { id: number };
    } catch (error) {
      logger.warn({ err: error }, "Token verification failed");
      return null;
    }
  }
}
