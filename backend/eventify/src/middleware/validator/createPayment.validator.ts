import { plainToClass } from "class-transformer";
import { validate, type ValidationError } from "class-validator";
import type { NextFunction, Request, Response } from "express";
import { CreatePaymentDto } from "../../dto/request/payment.dto";

export const CreatePaymentValidator = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const createPaymentDto = plainToClass(CreatePaymentDto, req.body);
  const errors: ValidationError[] = await validate(createPaymentDto);

  if (errors.length > 0) {
    const errorMessages = errors.flatMap((error) =>
      Object.values(error.constraints || {})
    );
    return res.status(400).json({ errors: errorMessages });
  } else {
    next();
  }
};
