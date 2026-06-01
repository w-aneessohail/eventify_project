import { plainToClass } from "class-transformer";
import { validate, type ValidationError } from "class-validator";
import type { NextFunction, Request, Response } from "express";
import { CreateCategoryDto } from "../../dto/request/category.dto";

export const CreateCategoryValidator = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const createCategoryDto = plainToClass(CreateCategoryDto, req.body);
  const errors: ValidationError[] = await validate(createCategoryDto);

  if (errors.length > 0) {
    const errorMessages = errors.flatMap((error) =>
      Object.values(error.constraints || {})
    );
    return res.status(400).json({ errors: errorMessages });
  } else {
    next();
  }
};
