import type { Response } from "express";

export type ApiResponse<T = unknown> = {
  success: boolean;
  message: string;
  data: T | null;
  errors: string[] | Record<string, unknown> | null;
};

export function sendSuccess<T>(
  res: Response,
  data: T | null = null,
  message = "OK",
  statusCode = 200
): Response {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    errors: null,
  } satisfies ApiResponse<T>);
}

export function sendError(
  res: Response,
  message: string,
  statusCode = 500,
  errors: string[] | Record<string, unknown> | null = null
): Response {
  return res.status(statusCode).json({
    success: false,
    message,
    data: null,
    errors,
  } satisfies ApiResponse);
}
