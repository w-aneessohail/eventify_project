import { plainToClass } from "class-transformer";
import { validate, type ValidationError } from "class-validator";
import type { NextFunction, Request, Response } from "express";
import { UpdateEventDto } from "../../dto/request/event.dto";

export const UpdateEventValidator = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const updateEventDto = plainToClass(UpdateEventDto, req.body);
  const errors: ValidationError[] = await validate(updateEventDto);

  if (errors.length > 0) {
    const errorMessages = errors.flatMap((error) =>
      Object.values(error.constraints || {})
    );
    return res.status(400).json({ errors: errorMessages });
  } else {
    next();
  }
};
