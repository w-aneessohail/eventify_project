import rateLimit from "express-rate-limit";
import { getConfig } from "../config/env";

const { windowMs, max } = getConfig().rateLimitAuth;

/** In-memory limiter for auth endpoints only (single-instance MVP). */
export const authRateLimiter = rateLimit({
  windowMs,
  max,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many attempts. Please try again later.",
    data: null,
    errors: null,
  },
});
