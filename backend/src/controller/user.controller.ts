import type { Request, Response } from "express";
import { userRepository, organizerRepository } from "../repository";
import { UserRole } from "../enum/userRole.enum";
import { toSafeUser } from "../dto/response/user.response.dto";
import { AccessService } from "../service/access.service";

export class UserController {
  static async getAllUsers(req: Request, res: Response) {
    try {
      const { skip = 0, limit = 10, ...whereParams } = req.query;
      const users = await userRepository.findAll(
        whereParams,
        Number(skip),
        Number(limit)
      );
      res.status(200).json(users.map((u) => toSafeUser(u)));
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Error fetching users" });
    }
  }

  static async getUserById(req: Request, res: Response) {
    const id = Number(req.params.id);
    const tokenUser = req.headers["user"] as { id?: number } | undefined;

    if (!tokenUser?.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const actor = await userRepository.findById(tokenUser.id);
    if (!actor) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!AccessService.canModifyUser(actor.role, actor.id, id)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const user = await userRepository.findById(id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(toSafeUser(user));
  }

  static async createUser(req: Request, res: Response) {
    try {
      const { role, organizerDetails, ...userData } = req.body;

      if (role === UserRole.ADMIN) {
        return res.status(403).json({
          message: "Admin accounts cannot be created via this endpoint",
        });
      }

      if (role === UserRole.ORGANIZER && !organizerDetails) {
        return res.status(400).json({
          message: "Organizer details are required when role is ORGANIZER",
        });
      }

      const newUser = await userRepository.createUser({ ...userData, role });

      if (role === UserRole.ORGANIZER && organizerDetails) {
        const newOrganizer = await organizerRepository.createOrganizer({
          ...organizerDetails,
          user: newUser,
        });
        return res.status(200).json({
          message: "Organizer created successfully, wait for approval",
          newUser: toSafeUser(newUser),
          newOrganizer,
        });
      }

      res.status(201).json({
        message: "User created successfully",
        user: toSafeUser(newUser),
      });
    } catch (error) {
      console.error("Error creating user:", error);
      res.status(500).json({ message: "Error creating user" });
    }
  }

  static async updateUser(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      const tokenUser = req.headers["user"] as { id?: number } | undefined;

      if (!tokenUser?.id) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const actor = await userRepository.findById(tokenUser.id);
      if (!actor) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const { name, email, organizerDetails } = req.body;
      const updatePayload: Record<string, unknown> = {};
      if (name !== undefined) updatePayload.name = name;
      if (email !== undefined) updatePayload.email = email;

      const result = await userRepository.updateUserForActor(
        id,
        actor.id,
        actor.role,
        updatePayload
      );

      if (result.error === "forbidden") {
        return res.status(403).json({ message: "Forbidden" });
      }
      if (result.error === "not_found") {
        return res.status(404).json({ message: "User not found" });
      }

      const updatedUser = result.user;

      if (organizerDetails && updatedUser.role === UserRole.ORGANIZER) {
        await organizerRepository.updateOrganizerByUserId(id, organizerDetails);
      }

      const userWithOrganizer = await userRepository.findById(id);
      res.status(200).json({ user: toSafeUser(userWithOrganizer) });
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ message: "Error updating user" });
    }
  }

  static async deleteUser(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      const tokenUser = req.headers["user"] as { id?: number } | undefined;

      if (!tokenUser?.id) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const actor = await userRepository.findById(tokenUser.id);
      if (!actor) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      if (id === actor.id) {
        return res.status(403).json({ message: "You cannot delete your own account" });
      }

      const target = await userRepository.findById(id);
      if (!target) {
        return res.status(404).json({ message: "User not found" });
      }

      if (target.role === UserRole.ADMIN) {
        const adminCount = await userRepository.countByRole(UserRole.ADMIN);
        if (adminCount <= 1) {
          return res.status(403).json({
            message: "Cannot delete the last admin account",
          });
        }
      }

      const deleted = await userRepository.deleteUser(id);

      if (!deleted) {
        return res.status(404).json({ message: "User not found" });
      }

      res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
      console.error("Error deleting user:", error);
      res.status(500).json({ message: "Error deleting user" });
    }
  }

  static async getLoggedInUser(req: Request, res: Response) {
    try {
      const tokenUser = req.headers["user"] as { id?: number } | undefined;

      if (!tokenUser?.id) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const foundUser = await userRepository.findById(tokenUser.id);

      if (!foundUser) {
        return res.status(404).json({ message: "User not found" });
      }

      res.status(200).json({
        user: toSafeUser(foundUser),
        isLoggedIn: true,
        message: "User details fetched successfully",
      });
    } catch (error) {
      console.error("Error fetching logged-in user:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
}
