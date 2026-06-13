import type { Repository } from "typeorm";
import type { Event } from "../entity/event.entity";
import type { Organizer } from "../entity/organizer.entity";
import { VerificationStatus } from "../enum/verificationStatus.enum";
import { UserRole } from "../enum/userRole.enum";

export type OrganizerGateResult =
  | { ok: true; organizer: Organizer }
  | { ok: false; message: string; statusCode: 403 };

export type BookabilityResult =
  | { ok: true }
  | { ok: false; message: string };

/** Shared approval rules for booking, payment, and public visibility. */
export class ApprovalService {
  constructor(
    private organizerRepository: Repository<Organizer>,
    private eventRepository: Repository<Event>
  ) {}

  static isPublicActor(role?: UserRole): boolean {
    return !role || role === UserRole.ATTENDEE;
  }

  static assertEventBookable(event: Event): BookabilityResult {
    if (event.status !== VerificationStatus.APPROVED) {
      return { ok: false, message: "Event is not available for booking" };
    }
    if (
      !event.organizer ||
      event.organizer.verificationStatus !== VerificationStatus.APPROVED
    ) {
      return {
        ok: false,
        message: "Event organizer is not approved",
      };
    }
    return { ok: true };
  }

  /** Only approved organizers may create events. */
  async requireApprovedOrganizer(
    organizerId: number
  ): Promise<OrganizerGateResult> {
    const organizer = await this.organizerRepository.findOne({
      where: { id: organizerId },
      relations: ["user"],
    });

    if (!organizer) {
      return {
        ok: false,
        message: "Organizer profile not found",
        statusCode: 403,
      };
    }

    if (organizer.verificationStatus === VerificationStatus.PENDING) {
      return {
        ok: false,
        message: "Organizer account is pending approval",
        statusCode: 403,
      };
    }

    if (organizer.verificationStatus === VerificationStatus.REJECTED) {
      return {
        ok: false,
        message: "Organizer account has been rejected",
        statusCode: 403,
      };
    }

    return { ok: true, organizer };
  }

  async approveOrganizer(
    organizerId: number,
    adminId: number
  ): Promise<Organizer | null> {
    const organizer = await this.organizerRepository.findOne({
      where: { id: organizerId },
    });
    if (!organizer) return null;

    organizer.verificationStatus = VerificationStatus.APPROVED;
    organizer.verifiedBy = adminId;
    organizer.verifiedAt = new Date();
    return this.organizerRepository.save(organizer);
  }

  async rejectOrganizer(
    organizerId: number,
    adminId: number
  ): Promise<Organizer | null> {
    const organizer = await this.organizerRepository.findOne({
      where: { id: organizerId },
    });
    if (!organizer) return null;

    organizer.verificationStatus = VerificationStatus.REJECTED;
    organizer.verifiedBy = adminId;
    organizer.verifiedAt = new Date();
    return this.organizerRepository.save(organizer);
  }

  async approveEvent(
    eventId: number,
    adminId: number
  ): Promise<Event | null> {
    const event = await this.eventRepository.findOne({
      where: { id: eventId },
      relations: ["organizer"],
    });
    if (!event) return null;

    if (event.organizer?.verificationStatus !== VerificationStatus.APPROVED) {
      return null;
    }

    event.status = VerificationStatus.APPROVED;
    event.verifiedBy = adminId;
    event.verifiedAt = new Date();
    return this.eventRepository.save(event);
  }

  async rejectEvent(eventId: number, adminId: number): Promise<Event | null> {
    const event = await this.eventRepository.findOne({ where: { id: eventId } });
    if (!event) return null;

    event.status = VerificationStatus.REJECTED;
    event.verifiedBy = adminId;
    event.verifiedAt = new Date();
    return this.eventRepository.save(event);
  }
}
