import type { Request, Response } from "express";
import {
  approvalRepository,
  eventRepository,
  eventImageRepository,
  userRepository,
} from "../repository";
import { resolveActor } from "../helper/actor.helper";
import { UserRole } from "../enum/userRole.enum";
import { VerificationStatus } from "../enum/verificationStatus.enum";

function canViewEvent(
  event: NonNullable<Awaited<ReturnType<typeof eventRepository.findById>>>,
  actor: Awaited<ReturnType<typeof resolveActor>>
): boolean {
  if (actor?.role === UserRole.ADMIN) return true;
  if (
    actor?.role === UserRole.ORGANIZER &&
    event.organizer?.user?.id === actor.id
  ) {
    return true;
  }
  return (
    event.status === VerificationStatus.APPROVED &&
    event.organizer?.verificationStatus === VerificationStatus.APPROVED
  );
}

export class EventController {
  static async createEvent(req: Request, res: Response) {
    try {
      const tokenUser = req.headers["user"] as { id?: number } | undefined;
      if (!tokenUser?.id) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const user = await userRepository.findById(tokenUser.id);
      const organizerId = user?.organizer?.id;
      if (!organizerId) {
        return res.status(403).json({ message: "Organizer profile not found" });
      }

      const gate = await approvalRepository.requireApprovedOrganizer(organizerId);
      if (gate.ok === false) {
        return res.status(gate.statusCode).json({ message: gate.message });
      }

      const { images, organizer: _clientOrganizer, status: _status, ...eventData } =
        req.body;

      const newEvent = await eventRepository.createEvent({
        ...eventData,
        organizer: { id: organizerId },
      });

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

      const actor = await resolveActor(req);
      const whereParams: Record<string, unknown> = {};
      if (categoryId) whereParams.categoryId = Number(categoryId);

      let events;

      if (actor?.role === UserRole.ADMIN) {
        if (status) whereParams.status = status;
        if (organizerId) whereParams.organizerId = Number(organizerId);
        events = await eventRepository.findAll(
          whereParams,
          Number(skip),
          Number(limit)
        );
      } else if (actor?.role === UserRole.ORGANIZER) {
        const ownOrganizerId = actor.organizer?.id;
        const requestedOrganizerId = organizerId
          ? Number(organizerId)
          : ownOrganizerId;

        if (
          requestedOrganizerId &&
          ownOrganizerId &&
          requestedOrganizerId === ownOrganizerId
        ) {
          whereParams.organizerId = ownOrganizerId;
          if (status) whereParams.status = status;
          events = await eventRepository.findAll(
            whereParams,
            Number(skip),
            Number(limit)
          );
        } else {
          events = await eventRepository.findAllPublic(
            whereParams,
            Number(skip),
            Number(limit)
          );
        }
      } else {
        events = await eventRepository.findAllPublic(
          whereParams,
          Number(skip),
          Number(limit)
        );
      }

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

      const actor = await resolveActor(req);
      if (!canViewEvent(event, actor)) {
        return res.status(404).json({ message: "Event not found" });
      }

      res.status(200).json(event);
    } catch (error) {
      console.error("Error fetching event:", error);
      res.status(500).json({ message: "Error fetching event" });
    }
  }

  static async updateEvent(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      const tokenUser = req.headers["user"] as { id?: number } | undefined;
      if (!tokenUser?.id) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const existing = await eventRepository.findById(id);
      if (!existing) {
        return res.status(404).json({ message: "Event not found" });
      }

      const actor = await userRepository.findById(tokenUser.id);
      if (
        !actor ||
        (actor.role !== UserRole.ADMIN &&
          existing.organizer?.user?.id !== actor.id)
      ) {
        return res.status(403).json({ message: "Forbidden" });
      }

      const { images, status: _status, ...eventData } = req.body;

      const updatedEvent = await eventRepository.updateEvent(id, eventData);
      if (!updatedEvent) {
        return res.status(404).json({ message: "Event not found" });
      }

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
      const tokenUser = req.headers["user"] as { id?: number } | undefined;
      if (!tokenUser?.id) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const existing = await eventRepository.findById(id);
      if (!existing) {
        return res.status(404).json({ message: "Event not found" });
      }

      const actor = await userRepository.findById(tokenUser.id);
      if (
        !actor ||
        (actor.role !== UserRole.ADMIN &&
          existing.organizer?.user?.id !== actor.id)
      ) {
        return res.status(403).json({ message: "Forbidden" });
      }

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
