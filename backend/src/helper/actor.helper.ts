import type { Request } from "express";
import { userRepository } from "../repository";
import type { User } from "../entity/user.entity";

export async function resolveActor(req: Request): Promise<User | null> {
  const tokenUser = req.headers["user"] as { id?: number } | undefined;
  if (!tokenUser?.id) return null;
  return userRepository.findById(tokenUser.id);
}
