import type { Repository, EntityManager } from "typeorm";
import { Payment } from "../entity/payment.entity";
import { Booking } from "../entity/booking.entity";
import { Event } from "../entity/event.entity";
import { BookingStatus } from "../enum/bookingStatus.enum";
import { PaymentMethod } from "../enum/paymentMethod.enum";
import { PaymentStatus } from "../enum/paymentStatus.enum";
import { ApprovalService } from "./approval.service";
import { notifyBookingConfirmed } from "../email/notifications";
import { logger } from "../config/logger";

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
   * Single entry point for payment success — used by Safepay webhooks
   * and verification scripts.
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
    logger.info(
      {
        bookingId: input.bookingId,
        attendeeId: input.attendeeId,
        externalTransactionId: input.externalTransactionId ?? null,
      },
      "confirmPayment invoked"
    );

    let emailAttempted = false;
    let emailSent = false;

    const result = await this.paymentRepository.manager.transaction(
      async (manager) => this.runConfirmPayment(manager, input)
    );

    if (result.ok && result.newlyConfirmed && result.booking && result.payment) {
      emailAttempted = true;
      try {
        await notifyBookingConfirmed(result.booking, result.payment);
        emailSent = true;
      } catch (err) {
        logger.error({ err, bookingId: input.bookingId }, "confirmPayment email failed");
      }
    }

    logger.info(
      {
        bookingId: input.bookingId,
        ok: result.ok,
        newlyConfirmed: result.newlyConfirmed === true,
        code: result.ok ? undefined : result.code,
        emailAttempted,
        emailSent,
      },
      "confirmPayment finished"
    );

    return result;
  }

  /** Persist Safepay tracker on a pending payment row so webhooks can resolve the booking. */
  async ensurePendingSafepayPayment(input: {
    bookingId: number;
    trackerToken: string;
    amount: number;
  }): Promise<{ created: boolean; updated: boolean }> {
    const existing = await this.paymentRepository
      .createQueryBuilder("payment")
      .where('payment."bookingId" = :bookingId', { bookingId: input.bookingId })
      .getOne();

    if (existing) {
      if (
        existing.status === PaymentStatus.PENDING &&
        existing.transactionId !== input.trackerToken
      ) {
        existing.transactionId = input.trackerToken;
        await this.paymentRepository.save(existing);
        return { created: false, updated: true };
      }
      return { created: false, updated: false };
    }

    await this.paymentRepository
      .createQueryBuilder()
      .insert()
      .into(Payment)
      .values({
        amount: input.amount,
        method: PaymentMethod.CARD,
        status: PaymentStatus.PENDING,
        transactionId: input.trackerToken,
        booking: { id: input.bookingId },
      })
      .execute();

    return { created: true, updated: false };
  }

  async findBookingIdByTracker(trackerToken: string): Promise<number | null> {
    const payment = await this.paymentRepository
      .createQueryBuilder("payment")
      .leftJoinAndSelect("payment.booking", "booking")
      .where("payment.transactionId = :trackerToken", { trackerToken })
      .getOne();

    return payment?.booking?.id ?? null;
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

      const audit: Record<string, unknown> = {
        bookingId: input.bookingId,
        bookingFound: Boolean(booking),
        paymentFound: false,
        paymentCreated: false,
        bookingStatusBefore: booking?.status ?? null,
        paymentStatusBefore: null as PaymentStatus | null,
        bookingStatusAfter: null as BookingStatus | null,
        paymentStatusAfter: null as PaymentStatus | null,
        ticketCountBefore: null as number | null,
        ticketCountAfter: null as number | null,
        newlyConfirmed: false,
      };

      if (!booking) {
        logger.warn(audit, "confirmPayment booking not found");
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

      audit.paymentFound = Boolean(payment);
      audit.paymentStatusBefore = payment?.status ?? null;

      const bookingStatus = String(booking.status).toLowerCase();

      if (
        bookingStatus === BookingStatus.CONFIRMED &&
        payment?.status === PaymentStatus.SUCCESS
      ) {
        audit.bookingStatusAfter = booking.status;
        audit.paymentStatusAfter = payment.status;
        logger.info(audit, "confirmPayment idempotent — already confirmed");
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
        logger.warn(audit, "confirmPayment event not found after lock");
        return { ok: false, code: "not_found", message: "Event not found" };
      }

      audit.ticketCountBefore = event.availableTickets;

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
        // Repair inconsistent state: payment succeeded but booking still pending
        booking.status = BookingStatus.CONFIRMED;
        event.availableTickets -= booking.quantity;
        await bookingRepo.save(booking);
        await eventRepo.save(event);

        const savedBooking = await bookingRepo.findOne({
          where: { id: booking.id },
          relations: ["event", "attendee", "payment"],
        });

        audit.bookingStatusAfter = savedBooking?.status ?? booking.status;
        audit.paymentStatusAfter = payment.status;
        audit.ticketCountAfter = event.availableTickets;
        audit.newlyConfirmed = true;
        logger.info(audit, "confirmPayment repaired inconsistent state");

        return {
          ok: true,
          payment,
          booking: savedBooking!,
          newlyConfirmed: true,
        };
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
        audit.paymentCreated = true;
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

      audit.bookingStatusAfter = savedBooking?.status ?? booking.status;
      audit.paymentStatusAfter = savedPayment?.status ?? payment.status;
      audit.ticketCountAfter = event.availableTickets;
      audit.newlyConfirmed = true;
      logger.info(audit, "confirmPayment succeeded");

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
