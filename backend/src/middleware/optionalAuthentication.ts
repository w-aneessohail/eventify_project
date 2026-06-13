import type { Request } from "express";
import Encrypt from "../helper/encrypt.helper";

/** Sets req.headers.user when a valid cookie token exists; never blocks. */
export const optionalAuthentication = async (
  req: Request,
  _res: unknown,
  next: () => void
) => {
  try {
    const token = req.cookies?.access_token;
    if (token) {
      const decode = Encrypt.verifyToken(token);
      if (decode) {
        req.headers["user"] = decode;
      }
    }
  } catch {
    // treat as anonymous
  }
  next();
};
