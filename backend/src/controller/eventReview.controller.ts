import type { Request, Response } from "express";
import { eventReviewRepository, eventRepository, userRepository } from "../repository";
import { ApprovalService } from "../service/approval.service";

export class EventReviewController {
  static async getAllReviews(req: Request, res: Response) {
    try {
      const { skip = 0, limit = 10, ...whereParams } = req.query;
      const reviews = await eventReviewRepository.findAll(
        whereParams,
        Number(skip),
        Number(limit)
      );
      res.status(200).json(reviews);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      res.status(500).json({ message: "Error fetching reviews" });
    }
  }

  static async getReviewById(req: Request, res: Response) {
    const id = Number(req.params.id);
    const review = await eventReviewRepository.findById(id);

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    res.status(200).json(review);
  }

  static async createReview(req: Request, res: Response) {
    try {
      const { eventId, userId, rating, comment } = req.body;
      const tokenUser = req.headers["user"] as { id?: number } | undefined;

      if (!tokenUser?.id || tokenUser.id !== Number(userId)) {
        return res.status(403).json({ message: "Forbidden" });
      }

      const event = await eventRepository.findById(Number(eventId));
      const attendee = await userRepository.findById(Number(userId));

      if (!event || !attendee) {
        return res.status(404).json({ message: "Event or user not found" });
      }

      const bookable = ApprovalService.assertEventBookable(event);
      if (bookable.ok === false) {
        return res.status(400).json({ message: bookable.message });
      }

      const newReview = await eventReviewRepository.createReview({
        event,
        attendee,
        rating,
        comment,
      });
      res.status(201).json(newReview);
    } catch (error) {
      console.error("Error creating review:", error);
      res.status(500).json({ message: "Error creating review" });
    }
  }

  static async updateReview(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      const updatedReview = await eventReviewRepository.updateReview(
        id,
        req.body
      );

      if (!updatedReview) {
        return res.status(404).json({ message: "Review not found" });
      }

      res.status(200).json(updatedReview);
    } catch (error) {
      console.error("Error updating review:", error);
      res.status(500).json({ message: "Error updating review" });
    }
  }

  static async deleteReview(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      const deleted = await eventReviewRepository.deleteReview(id);

      if (!deleted) {
        return res.status(404).json({ message: "Review not found" });
      }

      res.status(200).json({ message: "Review deleted successfully" });
    } catch (error) {
      console.error("Error deleting review:", error);
      res.status(500).json({ message: "Error deleting review" });
    }
  }
}
