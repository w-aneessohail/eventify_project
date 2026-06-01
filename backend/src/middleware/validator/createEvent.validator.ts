import { plainToClass } from "class-transformer";
import { validate, type ValidationError } from "class-validator";
import type { NextFunction, Request, Response } from "express";
import { CreateEventDto } from "../../dto/request/event.dto";

export const CreateEventValidator = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const createEventDto = plainToClass(CreateEventDto, req.body);
  const errors: ValidationError[] = await validate(createEventDto);

  if (errors.length > 0) {
    const errorMessages = errors.flatMap((error) =>
      Object.values(error.constraints || {})
    );
    return res.status(400).json({ errors: errorMessages });
  } else {
    next();
  }
};
