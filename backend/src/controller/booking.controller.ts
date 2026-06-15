import type { Request, Response } from "express";

import {

  bookingRepository,

  eventRepository,

  userRepository,

} from "../repository";

import { UserRole } from "../enum/userRole.enum";



export class BookingController {

  static async getMyBookings(req: Request, res: Response) {

    try {

      const tokenUser = req.headers["user"] as { id?: number } | undefined;



      if (!tokenUser?.id) {

        return res.status(401).json({ message: "Unauthorized" });

      }



      const { skip = 0, limit = 50 } = req.query;



      const bookings = await bookingRepository.findAll(

        { attendee: { id: tokenUser.id } },

        Number(skip),

        Number(limit)

      );



      res.status(200).json(bookings);

    } catch (error) {

      console.error("Error fetching attendee bookings:", error);

      res.status(500).json({ message: "Error fetching bookings" });

    }

  }



  static async getAllBookings(req: Request, res: Response) {

    try {

      const tokenUser = req.headers["user"] as { id?: number } | undefined;

      if (!tokenUser?.id) {

        return res.status(401).json({ message: "Unauthorized" });

      }

      const actor = await userRepository.findById(tokenUser.id);

      if (!actor) {

        return res.status(401).json({ message: "Unauthorized" });

      }

      const { status, eventId, attendeeId, skip = 0, limit = 10 } = req.query;



      const whereParams: any = {};



      if (status) whereParams.status = status;

      if (eventId) whereParams.event = { id: Number(eventId) };

      if (attendeeId) whereParams.attendee = { id: Number(attendeeId) };

      if (actor.role === UserRole.ORGANIZER) {

        if (!actor.organizer?.id) {

          return res.status(200).json([]);

        }

        whereParams.event = {

          ...(whereParams.event || {}),

          organizer: { id: actor.organizer.id },

        };

      }



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

      const tokenUser = req.headers["user"] as { id?: number } | undefined;



      if (!tokenUser?.id) {

        return res.status(401).json({ message: "Unauthorized" });

      }



      const actor = await userRepository.findById(tokenUser.id);

      if (!actor) {

        return res.status(401).json({ message: "Unauthorized" });

      }



      const result = await bookingRepository.findByIdForActor(

        id,

        actor.id,

        actor.role

      );



      if (result.error === "not_found") {

        return res.status(404).json({ message: "Booking not found" });

      }

      if (result.error === "forbidden") {

        return res.status(403).json({ message: "Forbidden" });

      }



      res.status(200).json(result.booking);

    } catch (error) {

      console.error("Error fetching booking:", error);

      res.status(500).json({ message: "Error fetching booking" });

    }

  }



  static async createBooking(req: Request, res: Response) {

    try {

      const tokenUser = req.headers["user"] as { id?: number } | undefined;

      if (!tokenUser?.id) {

        return res.status(401).json({ message: "Unauthorized" });

      }



      const { eventId, quantity } = req.body;



      const [event, attendee] = await Promise.all([

        eventRepository.findById(Number(eventId)),

        userRepository.findById(tokenUser.id),

      ]);



      if (!event) {

        return res.status(404).json({ message: "Event not found" });

      }

      if (!attendee) {

        return res.status(401).json({ message: "Unauthorized" });

      }



      const result = await bookingRepository.createForAttendee({

        event,

        attendee,

        quantity: Number(quantity),

      });



      if (!result.booking) {
        return res
          .status(result.statusCode ?? 400)
          .json({ message: result.error });
      }



      res.status(201).json(result.booking);

    } catch (error) {

      console.error("Error creating booking:", error);

      res.status(500).json({ message: "Error creating booking" });

    }

  }



  static async updateBooking(req: Request, res: Response) {

    try {

      const id = Number(req.params.id);

      const tokenUser = req.headers["user"] as { id?: number } | undefined;

      if (!tokenUser?.id) {

        return res.status(401).json({ message: "Unauthorized" });

      }

      const actor = await userRepository.findById(tokenUser.id);

      if (!actor) {

        return res.status(401).json({ message: "Unauthorized" });

      }

      const access = await bookingRepository.findByIdForActor(

        id,

        actor.id,

        actor.role

      );

      if (access.error === "not_found") {

        return res.status(404).json({ message: "Booking not found" });

      }

      if (access.error === "forbidden") {

        return res.status(403).json({ message: "Forbidden" });

      }

      const booking = access.booking;
      const { status } = req.body as { status?: string };

      if (status === undefined) {
        return res.status(400).json({ message: "No valid fields to update" });
      }

      if (String(status).toLowerCase() !== "cancelled") {
        return res.status(400).json({
          message:
            "Bookings can only be cancelled. Confirmation requires payment.",
        });
      }

      if (String(booking.status).toLowerCase() !== "pending") {
        return res.status(400).json({
          message: "Only pending bookings can be cancelled",
        });
      }

      const updatedBooking = await bookingRepository.cancelPendingBooking(id);



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

