import type { Repository } from "typeorm";
import type { Event } from "../entity/event.entity";
import { VerificationStatus } from "../enum/verificationStatus.enum";

export class EventService {
  constructor(private eventRepository: Repository<Event>) {}

  private baseRelations = [
    "images",
    "bookings",
    "reviews",
    "organizer",
    "organizer.user",
    "category",
  ] as const;

  async findAllPublic(
    whereParams: Record<string, unknown> = {},
    skip = 0,
    limit = 10
  ): Promise<Event[]> {
    const qb = this.eventRepository
      .createQueryBuilder("event")
      .leftJoinAndSelect("event.images", "images")
      .leftJoinAndSelect("event.organizer", "organizer")
      .leftJoinAndSelect("organizer.user", "organizerUser")
      .leftJoinAndSelect("event.category", "category")
      .where("event.status = :eventStatus", {
        eventStatus: VerificationStatus.APPROVED,
      })
      .andWhere("organizer.verificationStatus = :orgStatus", {
        orgStatus: VerificationStatus.APPROVED,
      });

    if (whereParams.categoryId) {
      qb.andWhere("category.id = :categoryId", {
        categoryId: Number(whereParams.categoryId),
      });
    }

    return qb
      .orderBy("event.createdAt", "DESC")
      .skip(skip)
      .take(limit)
      .getMany();
  }

  async findAll(
    whereParams: Record<string, unknown> = {},
    skip = 0,
    limit = 10
  ): Promise<Event[]> {
    const where: Record<string, unknown> = {};

    if (whereParams.status) where.status = whereParams.status;
    if (whereParams.organizerId) {
      where.organizer = { id: Number(whereParams.organizerId) };
    }
    if (whereParams.categoryId) {
      where.category = { id: Number(whereParams.categoryId) };
    }

    return this.eventRepository.find({
      where,
      relations: [...this.baseRelations],
      order: { createdAt: "DESC" },
      skip,
      take: limit,
    });
  }

  async findById(id: number): Promise<Event | null> {
    return this.eventRepository.findOne({
      where: { id },
      relations: [...this.baseRelations],
    });
  }

  async createEvent(eventData: Partial<Event>): Promise<Event> {
    const data = { ...eventData } as Partial<Event> & {
      status?: VerificationStatus;
      verifiedBy?: number | null;
      verifiedAt?: Date | null;
    };

    delete data.status;
    data.verifiedBy = null;
    data.verifiedAt = null;

    const event = this.eventRepository.create({
      ...data,
      status: VerificationStatus.PENDING,
    });
    return this.eventRepository.save(event);
  }

  async updateEvent(
    id: number,
    eventData: Partial<Event>
  ): Promise<Event | null> {
    const event = await this.eventRepository.findOne({
      where: { id },
      relations: ["images", "organizer", "category"],
    });
    if (!event) return null;

    const data = { ...eventData } as Partial<Event> & {
      status?: VerificationStatus;
      verifiedBy?: number | null;
      verifiedAt?: Date | null;
    };
    delete data.status;
    delete data.verifiedBy;
    delete data.verifiedAt;

    this.eventRepository.merge(event, data);

    if (event.status === VerificationStatus.APPROVED) {
      event.status = VerificationStatus.PENDING;
      event.verifiedBy = null;
      event.verifiedAt = null;
    }

    await this.eventRepository.save(event);
    return this.findById(id);
  }

  async deleteEvent(id: number): Promise<boolean> {
    const result = await this.eventRepository.delete({ id });
    return result.affected !== 0;
  }
}
