import { NextFunction, Request, Response } from "express";
import Encrypt from "../helper/encrypt.helper";
import { logger } from "../config/logger";

export const authentication = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.cookies.access_token;

    if (!token) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const decode = Encrypt.verifyToken(token);

    if (!decode) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    (req.headers as Record<string, unknown>)["user"] = decode;

    next();
  } catch (error) {
    logger.warn({ err: error }, "Authentication error");
    return res.status(401).json({ message: "Unauthorized" });
  }
};
