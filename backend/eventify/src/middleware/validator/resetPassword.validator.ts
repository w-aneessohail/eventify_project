import { plainToClass } from "class-transformer";
import { validate, ValidationError } from "class-validator";
import { NextFunction, Request, Response } from "express";
import { ResetPasswordDto } from "../../dto/request/auth.dto";

export const ResetPasswordValidator = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const resetPasswordDto = plainToClass(ResetPasswordDto, req.body);
  const errors: ValidationError[] = await validate(resetPasswordDto);

  if (errors.length > 0) {
    const errorMessages = errors
      .map((error) => Object.values(error.constraints || {}))
      .flat();
    return res.status(400).json({ errors: errorMessages });
  } else {
    next();
  }
};
