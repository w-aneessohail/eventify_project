import type { NextFunction, Request, Response } from "express";
import { AppError } from "../errors/AppError";
import { sendError } from "../helper/apiResponse.helper";
import { logger } from "../config/logger";
import { getConfig } from "../config/env";

export function notFoundHandler(req: Request, res: Response): void {
  sendError(res, `Route not found: ${req.method} ${req.originalUrl}`, 404);
}

export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (err instanceof AppError) {
    sendError(res, err.message, err.statusCode, err.errors ?? null);
    return;
  }

  if (err instanceof SyntaxError && "body" in err) {
    sendError(res, "Invalid JSON request body", 400);
    return;
  }

  const message = err instanceof Error ? err.message : "Unknown error";
  logger.error({ err, path: req.path, method: req.method }, "Unhandled error");

  sendError(
    res,
    getConfig().isProd ? "Internal server error" : message,
    500
  );
}
