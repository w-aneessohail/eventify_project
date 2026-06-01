import { plainToClass } from "class-transformer";
import { validate, type ValidationError } from "class-validator";
import type { NextFunction, Request, Response } from "express";
import { CreateEventReviewDto } from "../../dto/request/eventReview.dto";

export const CreateEventReviewValidator = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const createReviewDto = plainToClass(CreateEventReviewDto, req.body);
  const errors: ValidationError[] = await validate(createReviewDto);

  if (errors.length > 0) {
    const errorMessages = errors.flatMap((error) =>
      Object.values(error.constraints || {})
    );
    return res.status(400).json({ errors: errorMessages });
  } else {
    next();
  }
};
