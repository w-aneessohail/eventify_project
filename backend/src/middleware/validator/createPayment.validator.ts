import { plainToClass } from "class-transformer";
import { validate, type ValidationError } from "class-validator";
import type { NextFunction, Request, Response } from "express";
import { ConfirmPaymentDto } from "../../dto/request/payment.dto";

export const ConfirmPaymentValidator = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const dto = plainToClass(ConfirmPaymentDto, req.body);
  const errors: ValidationError[] = await validate(dto);

  if (errors.length > 0) {
    const errorMessages = errors.flatMap((error) =>
      Object.values(error.constraints || {})
    );
    return res.status(400).json({ errors: errorMessages });
  } else {
    next();
  }
};

/** @deprecated Use ConfirmPaymentValidator — kept for route import compatibility */
export const CreatePaymentValidator = ConfirmPaymentValidator;
