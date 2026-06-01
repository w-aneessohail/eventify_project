import { plainToClass } from "class-transformer";
import { validate, type ValidationError } from "class-validator";
import type { NextFunction, Request, Response } from "express";
import { UpdateBookingDto } from "../../dto/request/booking.dto";

export const UpdateBookingValidator = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const updateBookingDto = plainToClass(UpdateBookingDto, req.body);
  const errors: ValidationError[] = await validate(updateBookingDto);

  if (errors.length > 0) {
    const errorMessages = errors.flatMap((error) =>
      Object.values(error.constraints || {})
    );
    return res.status(400).json({ errors: errorMessages });
  } else {
    next();
  }
};
