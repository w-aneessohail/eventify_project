import { plainToClass } from "class-transformer";
import { validate, type ValidationError } from "class-validator";
import type { NextFunction, Request, Response } from "express";
import { ForgotPasswordDto } from "../../dto/request/auth.dto";
import { sendError } from "../../helper/apiResponse.helper";

export const ForgotPasswordValidator = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const dto = plainToClass(ForgotPasswordDto, req.body);
  const errors: ValidationError[] = await validate(dto);

  if (errors.length > 0) {
    const errorMessages = errors.flatMap((error) =>
      Object.values(error.constraints || {})
    );
    return sendError(res, "Validation failed", 400, errorMessages);
  }

  next();
};
