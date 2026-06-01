import type { Request, Response } from "express";
import { paymentRepository, bookingRepository } from "../repository";

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

  static async createPayment(req: Request, res: Response) {
    try {
      const { amount, method, transactionId, bookingId } = req.body;

      const booking = await bookingRepository.findById(bookingId);
      if (!booking)
        return res.status(404).json({ message: "Booking not found" });

      const newPayment = await paymentRepository.createPayment({
        amount,
        method,
        transactionId,
        booking,
      });

      res.status(201).json(newPayment);
    } catch (error) {
      console.error("Error creating payment:", error);
      res.status(500).json({ message: "Error creating payment" });
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
