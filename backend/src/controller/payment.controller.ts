import type { Request, Response } from "express";
import { paymentRepository } from "../repository";

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
    const payment = await paymentRepository.getPaymentById(id);
    if (!payment) return res.status(404).json({ message: "Payment not found" });
    res.status(200).json(payment);
  }

  /** Simulated checkout today; same handler future gateway webhooks will call. */
  static async confirmPayment(req: Request, res: Response) {
    try {
      const tokenUser = req.headers["user"] as { id?: number } | undefined;
      if (!tokenUser?.id) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const { bookingId, method } = req.body;

      const result = await paymentRepository.confirmPayment({
        bookingId: Number(bookingId),
        attendeeId: tokenUser.id,
        method,
      });

      if (!result.ok) {
        const status =
          result.code === "not_found"
            ? 404
            : result.code === "forbidden"
              ? 403
              : result.code === "conflict"
                ? 409
                : 400;
        return res.status(status).json({ message: result.message ?? "Payment failed" });
      }

      res.status(200).json({
        payment: result.payment,
        booking: result.booking,
      });
    } catch (error) {
      console.error("Error confirming payment:", error);
      res.status(500).json({ message: "Error processing payment" });
    }
  }

  static async updatePayment(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      const updatedPayment = await paymentRepository.updatePayment(
        id,
        req.body
      );
      if (!updatedPayment)
        return res.status(404).json({ message: "Payment not found" });
      res.status(200).json(updatedPayment);
    } catch (error) {
      console.error("Error updating payment:", error);
      res.status(500).json({ message: "Error updating payment" });
    }
  }

  static async deletePayment(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      const deleted = await paymentRepository.deletePayment(id);
      if (!deleted)
        return res.status(404).json({ message: "Payment not found" });
      res.status(200).json({ message: "Payment deleted successfully" });
    } catch (error) {
      console.error("Error deleting payment:", error);
      res.status(500).json({ message: "Error deleting payment" });
    }
  }
}
