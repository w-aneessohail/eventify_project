import { plainToClass } from "class-transformer";
import { validate, type ValidationError } from "class-validator";
import type { NextFunction, Request, Response } from "express";
import { CreateUserDto } from "../../dto/request/user.dto";

export const CreateUserValidator = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const createUserDto = plainToClass(CreateUserDto, req.body);
  const errors: ValidationError[] = await validate(createUserDto);

  if (errors.length > 0) {
    const errorMessages = errors.flatMap((error) =>
      Object.values(error.constraints || {})
    );
    return res.status(400).json({ errors: errorMessages });
  } else {
    next();
  }
};
