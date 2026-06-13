import type { Response } from "express";
import type { Request } from "express";
import { approvalRepository } from "../repository";
import { resolveActor } from "../helper/actor.helper";

export class ApprovalController {
  static async approveOrganizer(req: Request, res: Response) {
    const organizerId = Number(req.params.id);
    const actor = await resolveActor(req);
    if (!actor) return res.status(401).json({ message: "Unauthorized" });

    const organizer = await approvalRepository.approveOrganizer(
      organizerId,
      actor.id
    );
    if (!organizer) {
      return res.status(404).json({ message: "Organizer not found" });
    }
    res.status(200).json(organizer);
  }

  static async rejectOrganizer(req: Request, res: Response) {
    const organizerId = Number(req.params.id);
    const actor = await resolveActor(req);
    if (!actor) return res.status(401).json({ message: "Unauthorized" });

    const organizer = await approvalRepository.rejectOrganizer(
      organizerId,
      actor.id
    );
    if (!organizer) {
      return res.status(404).json({ message: "Organizer not found" });
    }
    res.status(200).json(organizer);
  }

  static async approveEvent(req: Request, res: Response) {
    const eventId = Number(req.params.id);
    const actor = await resolveActor(req);
    if (!actor) return res.status(401).json({ message: "Unauthorized" });

    const event = await approvalRepository.approveEvent(eventId, actor.id);
    if (!event) {
      return res.status(404).json({
        message: "Event not found or organizer is not approved",
      });
    }
    res.status(200).json(event);
  }

  static async rejectEvent(req: Request, res: Response) {
    const eventId = Number(req.params.id);
    const actor = await resolveActor(req);
    if (!actor) return res.status(401).json({ message: "Unauthorized" });

    const event = await approvalRepository.rejectEvent(eventId, actor.id);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }
    res.status(200).json(event);
  }
}
