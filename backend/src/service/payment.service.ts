import type { Repository, EntityManager } from "typeorm";
import { Payment } from "../entity/payment.entity";
import { Booking } from "../entity/booking.entity";
import { Event } from "../entity/event.entity";
import { BookingStatus } from "../enum/bookingStatus.enum";
import { PaymentMethod } from "../enum/paymentMethod.enum";
import { PaymentStatus } from "../enum/paymentStatus.enum";
import { ApprovalService } from "./approval.service";
import { notifyBookingConfirmed } from "../email/notifications";

export type ConfirmPaymentResult = {
  ok: boolean;
  payment?: Payment;
  booking?: Booking;
  newlyConfirmed?: boolean;
  code?: "not_found" | "forbidden" | "conflict" | "invalid_state";
  message?: string;
};

export class PaymentService {
  constructor(private paymentRepository: Repository<Payment>) {}

  async findAll(
    whereParams: any = {},
    skip = 0,
    limit = 10
  ): Promise<Payment[]> {
    return this.paymentRepository.find({
      where: { ...whereParams },
      relations: ["booking"],
      order: { createdAt: "DESC" },
      skip,
      take: limit,
    });
  }

  async getAllPayments(): Promise<Payment[]> {
    return this.findAll();
  }

  async getPaymentById(id: number): Promise<Payment | null> {
    return this.paymentRepository.findOne({
      where: { id },
      relations: ["booking"],
    });
  }

  /**
   * Single entry point for payment success — used by simulated checkout today
   * and future gateway webhooks (JazzCash, EasyPaisa, Stripe).
   *
   * One transaction: lock event → verify stock → confirm payment → confirm booking → decrement tickets.
   * Idempotent when booking is already confirmed with a successful payment.
   */
  async confirmPayment(input: {
    bookingId: number;
    attendeeId: number;
    method: PaymentMethod;
    externalTransactionId?: string;
  }): Promise<ConfirmPaymentResult> {
    const result = await this.paymentRepository.manager.transaction(
      async (manager) => this.runConfirmPayment(manager, input)
    );

    if (result.ok && result.newlyConfirmed && result.booking && result.payment) {
      await notifyBookingConfirmed(result.booking, result.payment);
    }

    return result;
  }

  private async runConfirmPayment(
    manager: EntityManager,
    input: {
      bookingId: number;
      attendeeId: number;
      method: PaymentMethod;
      externalTransactionId?: string;
    }
  ): Promise<ConfirmPaymentResult> {
      const bookingRepo = manager.getRepository(Booking);
      const paymentRepo = manager.getRepository(Payment);
      const eventRepo = manager.getRepository(Event);

      const booking = await bookingRepo.findOne({
        where: { id: input.bookingId },
        relations: ["attendee", "event"],
      });

      if (!booking) {
        return { ok: false, code: "not_found", message: "Booking not found" };
      }

      if (booking.attendee?.id !== input.attendeeId) {
        return { ok: false, code: "forbidden", message: "Forbidden" };
      }

      if (booking.status === BookingStatus.CANCELLED) {
        return {
          ok: false,
          code: "invalid_state",
          message: "Booking is cancelled",
        };
      }

      let payment = await paymentRepo
        .createQueryBuilder("payment")
        .where('payment."bookingId" = :bookingId', { bookingId: booking.id })
        .getOne();

      const bookingStatus = String(booking.status).toLowerCase();

      if (
        bookingStatus === BookingStatus.CONFIRMED &&
        payment?.status === PaymentStatus.SUCCESS
      ) {
        return { ok: true, payment, booking };
      }

      if (bookingStatus !== BookingStatus.PENDING) {
        return {
          ok: false,
          code: "invalid_state",
          message: "Booking cannot be paid",
        };
      }

      const eventForCheck = await eventRepo.findOne({
        where: { id: booking.event.id },
        relations: ["organizer"],
      });

      if (!eventForCheck) {
        return { ok: false, code: "not_found", message: "Event not found" };
      }

      const bookable = ApprovalService.assertEventBookable(eventForCheck);
      if (bookable.ok === false) {
        return {
          ok: false,
          code: "invalid_state",
          message: bookable.message,
        };
      }

      const event = await eventRepo.findOne({
        where: { id: booking.event.id },
        lock: { mode: "pessimistic_write" },
      });

      if (!event) {
        return { ok: false, code: "not_found", message: "Event not found" };
      }

      if (event.availableTickets < booking.quantity) {
        return {
          ok: false,
          code: "conflict",
          message: "Not enough tickets available",
        };
      }

      const transactionId =
        input.externalTransactionId ??
        `SIM_${Date.now()}_${booking.id}_${Math.random().toString(36).slice(2, 9)}`;

      if (payment?.status === PaymentStatus.SUCCESS) {
        booking.status = BookingStatus.CONFIRMED;
        await bookingRepo.save(booking);
        return { ok: true, payment, booking };
      }

      if (payment) {
        payment.method = input.method;
        payment.status = PaymentStatus.SUCCESS;
        payment.transactionId = transactionId;
        payment.amount = booking.totalAmount;
        await paymentRepo.save(payment);
      } else {
        const insertResult = await paymentRepo
          .createQueryBuilder()
          .insert()
          .into(Payment)
          .values({
            amount: booking.totalAmount,
            method: input.method,
            status: PaymentStatus.SUCCESS,
            transactionId,
            booking: { id: booking.id },
          })
          .returning("*")
          .execute();

        payment = paymentRepo.create(
          insertResult.raw[0] as Partial<Payment>
        );
      }

      booking.status = BookingStatus.CONFIRMED;
      event.availableTickets -= booking.quantity;

      await bookingRepo.save(booking);
      await eventRepo.save(event);

      const savedPayment = await paymentRepo.findOne({
        where: { id: payment.id },
        relations: ["booking"],
      });
      const savedBooking = await bookingRepo.findOne({
        where: { id: booking.id },
        relations: ["event", "attendee", "payment"],
      });

      return {
        ok: true,
        payment: savedPayment!,
        booking: savedBooking!,
        newlyConfirmed: true,
      };
  }

  async updatePayment(
    id: number,
    paymentData: Partial<Payment>
  ): Promise<Payment | null> {
    const payment = await this.paymentRepository.findOne({ where: { id } });
    if (!payment) return null;

    this.paymentRepository.merge(payment, paymentData);
    await this.paymentRepository.save(payment);
    return this.getPaymentById(id);
  }

  async deletePayment(id: number): Promise<boolean> {
    const result = await this.paymentRepository.delete({ id });
    return result.affected !== 0;
  }
}
