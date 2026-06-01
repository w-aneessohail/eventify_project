import { plainToClass } from "class-transformer";
import { validate, ValidationError } from "class-validator";
import { NextFunction, Request, Response } from "express";
import { VerifyOtpDto } from "../../dto/request/auth.dto";

export const VerifyOtpValidator = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const verifyOtpDto = plainToClass(VerifyOtpDto, req.body);
  const errors: ValidationError[] = await validate(verifyOtpDto);

  if (errors.length > 0) {
    const errorMessages = errors
      .map((error) => Object.values(error.constraints || {}))
      .flat();
    return res.status(400).json({ errors: errorMessages });
  } else {
    next();
  }
};
