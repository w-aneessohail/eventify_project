import type { Request, Response } from "express";
import { userRepository, organizerRepository } from "../repository";
import { UserRole } from "../enum/userRole.enum";

export class UserController {
  static async getAllUsers(req: Request, res: Response) {
    try {
      const { skip = 0, limit = 10, ...whereParams } = req.query;
      const users = await userRepository.findAll(
        whereParams,
        Number(skip),
        Number(limit)
      );
      res.status(200).json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Error fetching users" });
    }
  }

  static async getUserById(req: Request, res: Response) {
    const id = Number(req.params.id);
    const user = await userRepository.findById(id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
  }

  static async createUser(req: Request, res: Response) {
    try {
      const { role, organizerDetails, ...userData } = req.body;

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
          newUser,
          newOrganizer,
        });
      }

      res.status(201).json({
        message: "User created successfully",
        user: newUser,
      });
    } catch (error) {
      console.error("Error creating user:", error);
      res.status(500).json({ message: "Error creating user" });
    }
  }

  static async updateUser(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      const { organizerDetails } = req.body;

      const updatedUser = await userRepository.updateUser(id, req.body);

      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }

      if (organizerDetails && updatedUser.role === UserRole.ORGANIZER) {
        await organizerRepository.updateOrganizerByUserId(id, organizerDetails);
      }

      const userWithOrganizer = await userRepository.findById(id);
      res.status(200).json(userWithOrganizer);
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ message: "Error updating user" });
    }
  }

  static async deleteUser(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
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
      const user = req.headers["user"] as any;

      const foundUser = await userRepository.findById(user.Id);

      if (!foundUser) {
        return res.status(404).json({ message: "User not found" });
      }

      res.status(200).json({
        user: foundUser,
        isLoggedIn: true,
        message: "User details fetched successfully",
      });
    } catch (error) {
      console.error("Error fetching logged-in user:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
}
