import type { Request, Response } from "express";
import {
  bookingRepository,
  eventRepository,
  userRepository,
} from "../repository";

export class BookingController {
  static async getAllBookings(req: Request, res: Response) {
    try {
      const { status, eventId, attendeeId, skip = 0, limit = 10 } = req.query;

      const whereParams: any = {};

      if (status) whereParams.status = status;
      if (eventId) whereParams.eventId = Number(eventId);
      if (attendeeId) whereParams.attendeeId = Number(attendeeId);

      const bookings = await bookingRepository.findAll(
        whereParams,
        Number(skip),
        Number(limit)
      );

      res.status(200).json(bookings);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      res.status(500).json({ message: "Error fetching bookings" });
    }
  }

  static async getBookingById(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      const booking = await bookingRepository.findById(id);
      if (!booking)
        return res.status(404).json({ message: "Booking not found" });
      res.status(200).json(booking);
    } catch (error) {
      console.error("Error fetching booking:", error);
      res.status(500).json({ message: "Error fetching booking" });
    }
  }

  static async createBooking(req: Request, res: Response) {
    try {
      const { eventId, attendeeId, quantity, totalAmount, status } = req.body;

      const event = await eventRepository.findById(eventId);
      const attendee = await userRepository.findById(attendeeId);

      if (!event || !attendee)
        return res.status(404).json({ message: "Event or Attendee not found" });

      const newBooking = await bookingRepository.createBooking({
        event,
        attendee,
        quantity,
        totalAmount,
        status,
      });

      res.status(201).json(newBooking);
    } catch (error) {
      console.error("Error creating booking:", error);
      res.status(500).json({ message: "Error creating booking" });
    }
  }

  static async updateBooking(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      const updatedBooking = await bookingRepository.updateBooking(
        id,
        req.body
      );

      if (!updatedBooking)
        return res.status(404).json({ message: "Booking not found" });

      res.status(200).json(updatedBooking);
    } catch (error) {
      console.error("Error updating booking:", error);
      res.status(500).json({ message: "Error updating booking" });
    }
  }

  static async deleteBooking(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      const deleted = await bookingRepository.deleteBooking(id);

      if (!deleted)
        return res.status(404).json({ message: "Booking not found" });

      res.status(200).json({ message: "Booking deleted successfully" });
    } catch (error) {
      console.error("Error deleting booking:", error);
      res.status(500).json({ message: "Error deleting booking" });
    }
  }
}
