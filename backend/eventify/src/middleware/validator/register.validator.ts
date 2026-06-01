import { plainToClass } from "class-transformer";
import { validate, ValidationError } from "class-validator";
import { NextFunction, Request, Response } from "express";
import { RegisterDto } from "../../dto/request/auth.dto";

export const RegisterValidator = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const registerDto = plainToClass(RegisterDto, req.body);
  const errors: ValidationError[] = await validate(registerDto);

  if (errors.length > 0) {
    const errorMessages = errors
      .map((error) => Object.values(error.constraints || {}))
      .flat();
    return res.status(400).json({ errors: errorMessages });
  } else {
    next();
  }
};
