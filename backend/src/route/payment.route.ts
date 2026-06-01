import * as express from "express";
import { PaymentController } from "../controller/payment.controller";
import { UserRole } from "../enum/userRole.enum";
import { authentication } from "../middleware/authentication";
import { authorization } from "../middleware/authorization";
import { CreatePaymentValidator } from "../middleware/validator/createPayment.validator";

const Router = express.Router();

Router.get(
  "/payments",
  authentication,
  authorization([UserRole.ADMIN]),
  PaymentController.getAllPayments
);
Router.get(
  "/payments/:id",
  authentication,
  authorization([UserRole.ADMIN, UserRole.ATTENDEE]),
  PaymentController.getPaymentById
);
Router.post(
  "/payments",
  authentication,
  authorization([UserRole.ATTENDEE]),
  CreatePaymentValidator,
  PaymentController.createPayment
);
Router.put(
  "/payments/:id",
  authentication,
  authorization([UserRole.ADMIN]),
  PaymentController.updatePayment
);
Router.delete(
  "/payments/:id",
  authentication,
  authorization([UserRole.ADMIN]),
  PaymentController.deletePayment
);

export { Router as paymentRouter };
