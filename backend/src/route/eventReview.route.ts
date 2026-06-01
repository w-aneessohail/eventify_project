import * as express from "express";
import { EventReviewController } from "../controller/eventReview.controller";
import { UserRole } from "../enum/userRole.enum";
import { authentication } from "../middleware/authentication";
import { authorization } from "../middleware/authorization";
import { CreateEventReviewValidator } from "../middleware/validator/createEventReview.validator";

const Router = express.Router();

Router.get("/event-reviews", EventReviewController.getAllReviews);
Router.get("/event-reviews/:id", EventReviewController.getReviewById);
Router.post(
  "/event-reviews",
  authentication,
  authorization([UserRole.ATTENDEE]),
  CreateEventReviewValidator,
  EventReviewController.createReview
);
Router.put(
  "/event-reviews/:id",
  authentication,
  authorization([UserRole.ATTENDEE]),
  EventReviewController.updateReview
);
Router.delete(
  "/event-reviews/:id",
  authentication,
  authorization([UserRole.ATTENDEE, UserRole.ADMIN]),
  EventReviewController.deleteReview
);

export { Router as eventReviewRouter };
