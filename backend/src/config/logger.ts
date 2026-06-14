import pino = require("pino");
import { getConfig } from "./env";

export const logger = pino({
  level: getConfig().logLevel,
  redact: {
    paths: [
      "password",
      "newPassword",
      "req.headers.authorization",
      "req.headers.cookie",
      "access_token",
      "refresh_token",
      "token",
      "otp",
    ],
    remove: true,
  },
  ...(getConfig().isDev
    ? {
        transport: {
          target: "pino-pretty",
          options: { colorize: true, translateTime: "SYS:standard" },
        },
      }
    : {}),
});
