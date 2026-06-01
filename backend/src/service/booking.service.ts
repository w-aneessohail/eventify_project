import type { Repository } from "typeorm";
import type { Booking } from "../entity/booking.entity";

export class BookingService {
  constructor(private bookingRepository: Repository<Booking>) {}

  async findAll(
    whereParams: any = {},
    skip = 0,
    limit = 10
  ): Promise<Booking[]> {
    return this.bookingRepository.find({
      where: { ...whereParams },
      relations: ["event", "attendee", "payments"],
      order: { createdAt: "DESC" },
      skip,
      take: limit,
    });
  }

  async findById(id: number): Promise<Booking | null> {
    return this.bookingRepository.findOne({
      where: { id },
      relations: ["event", "attendee", "payments"],
    });
  }

  async createBooking(bookingData: Partial<Booking>): Promise<Booking> {
    const booking = this.bookingRepository.create(bookingData);
    return this.bookingRepository.save(booking);
  }

  async updateBooking(
    id: number,
    bookingData: Partial<Booking>
  ): Promise<Booking | null> {
    const booking = await this.bookingRepository.findOne({
      where: { id },
      relations: ["event", "attendee", "payments"],
    });

    if (!booking) return null;

    this.bookingRepository.merge(booking, bookingData);
    await this.bookingRepository.save(booking);
    return this.findById(id);
  }

  async deleteBooking(id: number): Promise<boolean> {
    const result = await this.bookingRepository.delete({ id });
    return result.affected !== 0;
  }
}
