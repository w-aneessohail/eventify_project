import type { Repository } from "typeorm";
import type { Event } from "../entity/event.entity";

export class EventService {
  constructor(private eventRepository: Repository<Event>) {}

  async findAll(whereParams: any = {}, skip = 0, limit = 10): Promise<Event[]> {
    return this.eventRepository.find({
      where: { ...whereParams },
      relations: ["images", "bookings", "reviews", "organizer", "category"],
      order: { createdAt: "DESC" },
      skip,
      take: limit,
    });
  }

  async findById(id: number): Promise<Event | null> {
    return this.eventRepository.findOne({
      where: { id },
      relations: ["images", "bookings", "reviews", "organizer", "category"],
    });
  }

  async createEvent(eventData: Partial<Event>): Promise<Event> {
    const event = this.eventRepository.create(eventData);
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

    this.eventRepository.merge(event, eventData);
    await this.eventRepository.save(event);
    return this.findById(id);
  }

  async deleteEvent(id: number): Promise<boolean> {
    const result = await this.eventRepository.delete({ id });
    return result.affected !== 0;
  }
}
