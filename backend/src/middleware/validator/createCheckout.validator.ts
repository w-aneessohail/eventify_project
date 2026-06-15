import { plainToClass } from "class-transformer";
import { validate, type ValidationError } from "class-validator";
import type { NextFunction, Request, Response } from "express";
import { CreateCheckoutDto } from "../../dto/request/createCheckout.dto";

export const CreateCheckoutValidator = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const dto = plainToClass(CreateCheckoutDto, req.body);
  const errors: ValidationError[] = await validate(dto);

  if (errors.length > 0) {
    const errorMessages = errors.flatMap((error) =>
      Object.values(error.constraints || {})
    );
    return res.status(400).json({ errors: errorMessages });
  }

  next();
};
