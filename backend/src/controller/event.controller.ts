import type { Request, Response } from "express";
import { eventRepository, eventImageRepository } from "../repository";

export class EventController {
  static async createEvent(req: Request, res: Response) {
    try {
      const { images, ...eventData } = req.body;

      const newEvent = await eventRepository.createEvent(eventData);

      if (images && images.length > 0) {
        await eventImageRepository.addImages(newEvent.id, images);
      }

      const eventWithImages = await eventRepository.findById(newEvent.id);
      res.status(201).json(eventWithImages);
    } catch (error) {
      console.error("Error creating event:", error);
      res.status(500).json({ message: "Error creating event" });
    }
  }

  static async getAllEvents(req: Request, res: Response) {
    try {
      const {
        status,
        organizerId,
        categoryId,
        skip = 0,
        limit = 10,
      } = req.query;

      const whereParams: any = {};

      if (status) whereParams.status = status;
      if (organizerId) whereParams.organizerId = Number(organizerId);
      if (categoryId) whereParams.categoryId = Number(categoryId);

      const events = await eventRepository.findAll(
        whereParams,
        Number(skip),
        Number(limit)
      );

      res.status(200).json(events);
    } catch (error) {
      console.error("Error fetching events:", error);
      res.status(500).json({ message: "Error fetching events" });
    }
  }

  static async getEventById(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      const event = await eventRepository.findById(id);
      if (!event) return res.status(404).json({ message: "Event not found" });
      res.status(200).json(event);
    } catch (error) {
      console.error("Error fetching event:", error);
      res.status(500).json({ message: "Error fetching event" });
    }
  }

  static async updateEvent(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      const { images, ...eventData } = req.body;

      const updatedEvent = await eventRepository.updateEvent(id, eventData);
      if (!updatedEvent)
        return res.status(404).json({ message: "Event not found" });

      if (images && images.length > 0) {
        await eventImageRepository.addImages(id, images);
      }

      const eventWithImages = await eventRepository.findById(id);
      res.status(200).json(eventWithImages);
    } catch (error) {
      console.error("Error updating event:", error);
      res.status(500).json({ message: "Error updating event" });
    }
  }

  static async deleteEvent(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);

      await eventImageRepository.deleteImagesByEvent(id);

      const deleted = await eventRepository.deleteEvent(id);
      if (!deleted) return res.status(404).json({ message: "Event not found" });

      res.status(200).json({ message: "Event deleted successfully" });
    } catch (error) {
      console.error("Error deleting event:", error);
      res.status(500).json({ message: "Error deleting event" });
    }
  }
}
