import type { Repository } from "typeorm";

import type { Booking } from "../entity/booking.entity";

import type { Event } from "../entity/event.entity";

import type { User } from "../entity/user.entity";

import { BookingStatus } from "../enum/bookingStatus.enum";

import { UserRole } from "../enum/userRole.enum";

import { AccessService } from "./access.service";

import { ApprovalService } from "./approval.service";



export type BookingAccessResult =

  | { booking: Booking; error?: undefined }

  | { booking?: undefined; error: "not_found" | "forbidden" };



export type CreateBookingResult = {
  booking?: Booking;
  error?: string;
  statusCode?: 400 | 404 | 409;
};



export class BookingService {

  constructor(private bookingRepository: Repository<Booking>) {}



  async findAll(

    whereParams: any = {},

    skip = 0,

    limit = 10

  ): Promise<Booking[]> {

    return this.bookingRepository.find({

      where: { ...whereParams },

      relations: ["event", "attendee", "payment"],

      order: { createdAt: "DESC" },

      skip,

      take: limit,

    });

  }



  async findById(id: number): Promise<Booking | null> {

    return this.bookingRepository.findOne({

      where: { id },

      relations: ["event", "attendee", "payment"],

    });

  }



  async findByIdForActor(

    bookingId: number,

    actorId: number,

    actorRole: UserRole

  ): Promise<BookingAccessResult> {

    const booking = await this.findById(bookingId);

    if (!booking) return { error: "not_found" };

    if (!AccessService.canViewBooking(actorRole, actorId, booking)) {

      return { error: "forbidden" };

    }

    return { booking };

  }



  /**

   * Creates a pending booking. Price and attendee are determined server-side.

   * Stock is verified again under row lock at payment confirmation.

   */

  async createForAttendee(params: {

    event: Event;

    attendee: User;

    quantity: number;

  }): Promise<CreateBookingResult> {

    const { event, attendee, quantity } = params;

    const bookable = ApprovalService.assertEventBookable(event);
    if (bookable.ok === false) {
      return {
        error: bookable.message,
        statusCode: 400,
      };
    }



    if (quantity < 1) {

      return { error: "Quantity must be at least 1", statusCode: 400 };

    }



    if (event.availableTickets < quantity) {

      return {

        error: "Not enough tickets available",

        statusCode: 409,

      };

    }



    const totalAmount = Number(event.ticketPrice) * quantity;



    const booking = await this.createBooking({

      event,

      attendee,

      quantity,

      totalAmount,

      status: BookingStatus.PENDING,

      bookingDate: new Date(),

    });



    return { booking: await this.findById(booking.id) };

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

      relations: ["event", "attendee", "payment"],

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

