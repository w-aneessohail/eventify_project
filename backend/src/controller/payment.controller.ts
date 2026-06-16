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

      const pendingPayment = await paymentRepository.ensurePendingSafepayPayment({
        bookingId: booking.id,
        trackerToken: checkout.trackerToken,
        amount: Number(booking.totalAmount),
      });

      logger.info(
        {
          bookingId: booking.id,
          tracker: checkout.trackerToken,
          pendingPaymentCreated: pendingPayment.created,
          pendingPaymentUpdated: pendingPayment.updated,
        },
        "Safepay checkout session created"
      );

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
    const rawPayloadText = Buffer.isBuffer(rawBody)
      ? rawBody.toString("utf8")
      : "";

    if (!Buffer.isBuffer(rawBody) || rawBody.length === 0) {
      return res.status(400).json({ message: "Missing webhook body" });
    }

    const verification = SafepayService.verifyWebhookSignature(rawBody, signature);
    const signatureValid = verification.ok === true;

    if (!signatureValid) {
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
        { reason: verification.reason, signatureValid: false },
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
      payload = JSON.parse(rawPayloadText);
    } catch {
      return res.status(400).json({ message: "Invalid webhook JSON" });
    }

    const parsed = SafepayService.parseWebhookPayload(payload);
    let bookingId = parsed.bookingId;
    let bookingIdSource: string = bookingId ? "payload" : "none";

    logger.info(
      {
        eventType: parsed.eventType,
        tracker: parsed.tracker,
        bookingId,
        orderId: bookingId,
        metadata: parsed.rawMetadata,
        rawPayload: payload,
        isPaymentSuccess: parsed.isPaymentSuccess,
        signatureValid,
        confirmPaymentCalled: false,
      },
      "Safepay webhook received"
    );

    if (!parsed.isPaymentSuccess) {
      return res.status(200).json({ received: true, action: "ignored" });
    }

    if (!bookingId && parsed.tracker) {
      const fromPayment = await paymentRepository.findBookingIdByTracker(
        parsed.tracker
      );
      if (fromPayment) {
        bookingId = fromPayment;
        bookingIdSource = "pending_payment_tracker";
      }
    }

    if (!bookingId && parsed.tracker) {
      const fromTracker = await SafepayService.fetchTrackerBookingId(
        parsed.tracker
      );
      if (fromTracker) {
        bookingId = fromTracker;
        bookingIdSource = "safepay_tracker_api";
      }
    }

    if (!bookingId) {
      logger.warn(
        {
          eventType: parsed.eventType,
          tracker: parsed.tracker,
          metadata: parsed.rawMetadata,
        },
        "Webhook missing order_id after all resolution attempts"
      );
      return res.status(200).json({ received: true, action: "no_booking_id" });
    }

    const booking = await bookingRepository.findById(bookingId);
    if (!booking?.attendee?.id) {
      logger.warn({ bookingId, bookingIdSource }, "Webhook booking not found");
      return res.status(200).json({ received: true, action: "booking_not_found" });
    }

    let result;
    let confirmPaymentCalled = false;

    try {
      confirmPaymentCalled = true;
      result = await paymentRepository.confirmPayment({
        bookingId,
        attendeeId: booking.attendee.id,
        method: PaymentMethod.CARD,
        externalTransactionId: parsed.tracker ?? undefined,
      });
    } catch (err) {
      logger.error(
        {
          err,
          eventType: parsed.eventType,
          tracker: parsed.tracker,
          bookingId,
          bookingIdSource,
          stack: err instanceof Error ? err.stack : undefined,
        },
        "Safepay webhook confirmPayment threw"
      );
      return res.status(500).json({
        message: "Payment confirmation failed",
        received: true,
      });
    }

    logger.info(
      {
        eventType: parsed.eventType,
        tracker: parsed.tracker,
        bookingId,
        bookingIdSource,
        metadata: parsed.rawMetadata,
        signatureValid,
        confirmPaymentCalled,
        confirmPaymentResult: {
          ok: result.ok,
          newlyConfirmed: result.newlyConfirmed === true,
          code: result.ok ? undefined : result.code,
          message: result.ok ? undefined : result.message,
        },
      },
      result.ok
        ? "Safepay webhook confirmPayment succeeded"
        : "Safepay webhook confirmPayment did not succeed"
    );

    return res.status(200).json({
      received: true,
      confirmed: result.ok,
      newlyConfirmed: result.newlyConfirmed === true,
      code: result.ok ? undefined : result.code,
    });
  }
}
