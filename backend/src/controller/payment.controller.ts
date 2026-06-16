import type { Request, Response } from "express";
import {
  paymentRepository,
  bookingRepository,
  userRepository,
} from "../repository";
import { UserRole } from "../enum/userRole.enum";
import { BookingStatus } from "../enum/bookingStatus.enum";
import { PaymentMethod } from "../enum/paymentMethod.enum";
import { SafepayService } from "../service/safepay.service";
import { logger } from "../config/logger";

export class PaymentController {
  static async getAllPayments(req: Request, res: Response) {
    try {
      const { skip = 0, limit = 10, ...whereParams } = req.query;
      const payments = await paymentRepository.findAll(
        whereParams,
        Number(skip),
        Number(limit)
      );
      res.status(200).json(payments);
    } catch (error) {
      console.error("Error fetching payments:", error);
      res.status(500).json({ message: "Error fetching payments" });
    }
  }

  static async getPaymentById(req: Request, res: Response) {
    const id = Number(req.params.id);
    const tokenUser = req.headers["user"] as { id?: number } | undefined;

    if (!tokenUser?.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const actor = await userRepository.findById(tokenUser.id);
    if (!actor) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const payment = await paymentRepository.getPaymentById(id);
    if (!payment) return res.status(404).json({ message: "Payment not found" });

    if (actor.role !== UserRole.ADMIN) {
      const bookingId = payment.booking?.id;
      if (!bookingId) {
        return res.status(403).json({ message: "Forbidden" });
      }

      const access = await bookingRepository.findByIdForActor(
        bookingId,
        actor.id,
        actor.role
      );
      if (access.error === "not_found") {
        return res.status(404).json({ message: "Payment not found" });
      }
      if (access.error === "forbidden") {
        return res.status(403).json({ message: "Forbidden" });
      }
    }

    res.status(200).json(payment);
  }

  /** Creates a Safepay hosted checkout session and returns the redirect URL. */
  static async createCheckout(req: Request, res: Response) {
    try {
      const tokenUser = req.headers["user"] as { id?: number } | undefined;
      if (!tokenUser?.id) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const actor = await userRepository.findById(tokenUser.id);
      if (!actor) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const bookingId = Number(req.body.bookingId);
      const access = await bookingRepository.findByIdForActor(
        bookingId,
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
      const status = String(booking.status).toLowerCase();

      if (status === BookingStatus.CONFIRMED) {
        return res.status(409).json({ message: "Booking is already confirmed" });
      }
      if (status === BookingStatus.CANCELLED) {
        return res
          .status(400)
          .json({ message: "Booking is cancelled and cannot be paid" });
      }

      const checkout = await SafepayService.createHostedCheckout({
        bookingId: booking.id,
        amountPkr: Number(booking.totalAmount),
      });

      res.status(200).json({
        checkoutUrl: checkout.checkoutUrl,
        trackerToken: checkout.trackerToken,
      });
    } catch (error) {
      logger.error({ err: error }, "Safepay checkout creation failed");
      res.status(502).json({
        message: "Unable to start Safepay checkout. Please try again.",
      });
    }
  }

  /**
   * Safepay webhook — verify signature, then delegate to confirmPayment().
   * Must receive the raw request body (registered before express.json).
   */
  static async handleWebhook(req: Request, res: Response) {
    const rawBody = req.body as Buffer;
    const signature = req.headers["x-sfpy-signature"] as string | undefined;

    if (!Buffer.isBuffer(rawBody) || rawBody.length === 0) {
      return res.status(400).json({ message: "Missing webhook body" });
    }

    const verification = SafepayService.verifyWebhookSignature(rawBody, signature);

    if (verification.ok === false) {
      if (verification.reason === "missing_secret") {
        logger.error(
          "Safepay webhook rejected: SAFEPAY_WEBHOOK_SECRET is not configured"
        );
        return res.status(503).json({
          message:
            "Webhook signing secret is not configured. Set SAFEPAY_WEBHOOK_SECRET.",
        });
      }

      logger.warn(
        { reason: verification.reason },
        "Safepay webhook signature verification failed"
      );
      return res.status(400).json({
        message:
          verification.reason === "missing_signature"
            ? "Missing X-SFPY-SIGNATURE header"
            : "Invalid webhook signature",
      });
    }

    let payload: unknown;
    try {
      payload = JSON.parse(rawBody.toString("utf8"));
    } catch {
      return res.status(400).json({ message: "Invalid webhook JSON" });
    }

    const parsed = SafepayService.parseWebhookPayload(payload);

    logger.info(
      {
        eventType: parsed.eventType,
        tracker: parsed.tracker,
        bookingId: parsed.bookingId,
        isPaymentSuccess: parsed.isPaymentSuccess,
        signatureValid: true,
      },
      "Safepay webhook received"
    );

    if (!parsed.isPaymentSuccess) {
      return res.status(200).json({ received: true, action: "ignored" });
    }

    let bookingId = parsed.bookingId;
    if (!bookingId) {
      logger.warn({ eventType: parsed.eventType }, "Webhook missing order_id");
      return res.status(200).json({ received: true, action: "no_booking_id" });
    }

    const booking = await bookingRepository.findById(bookingId);
    if (!booking?.attendee?.id) {
      logger.warn({ bookingId }, "Webhook booking not found");
      return res.status(200).json({ received: true, action: "booking_not_found" });
    }

    const result = await paymentRepository.confirmPayment({
      bookingId,
      attendeeId: booking.attendee.id,
      method: PaymentMethod.CARD,
      externalTransactionId: parsed.tracker ?? undefined,
    });

    logger.info(
      {
        eventType: parsed.eventType,
        tracker: parsed.tracker,
        bookingId,
        confirmPaymentExecuted: true,
        confirmed: result.ok,
        newlyConfirmed: result.newlyConfirmed === true,
        code: result.ok ? undefined : result.code,
      },
      result.ok
        ? "Safepay webhook confirmPayment succeeded"
        : "Safepay webhook confirmPayment did not succeed"
    );

    return res.status(200).json({
      received: true,
      confirmed: result.ok,
      newlyConfirmed: result.newlyConfirmed === true,
    });
  }
}
