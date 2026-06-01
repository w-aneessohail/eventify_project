import { NextFunction, Request, Response } from "express";
import { userRepository } from "../repository/index";

export const authorization = (roles: string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const user = req.headers["user"] as { id?: number } | undefined;

    if (!user?.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const userData = await userRepository.findById(user.id);

    if (!userData) {
      return res.status(403).json({ message: "Forbidden" });
    }

    if (!roles.includes(userData.role)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    next();
  };
};
