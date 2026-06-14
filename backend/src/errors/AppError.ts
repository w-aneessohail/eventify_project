export class AppError extends Error {
  readonly statusCode: number;
  readonly errors?: string[] | Record<string, unknown> | null;
  readonly isOperational: boolean;

  constructor(
    message: string,
    statusCode = 500,
    errors?: string[] | Record<string, unknown> | null
  ) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.errors = errors ?? null;
    this.isOperational = true;
  }
}
