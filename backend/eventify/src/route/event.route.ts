import * as express from "express";
import { EventController } from "../controller/event.controller";
import { authentication } from "../middleware/authentication";
import { authorization } from "../middleware/authorization";
import { UserRole } from "../enum/userRole.enum";
import { CreateEventValidator } from "../middleware/validator/createEvent.validator";
import { UpdateEventValidator } from "../middleware/validator/updateEvent.validator";

const Router = express.Router();

Router.get("/events", EventController.getAllEvents);
Router.get("/events/:id", EventController.getEventById);
Router.post(
  "/events",
  authentication,
  authorization([UserRole.ORGANIZER]),
  CreateEventValidator,
  EventController.createEvent
);
Router.put(
  "/events/:id",
  authentication,
  authorization([UserRole.ORGANIZER]),
  UpdateEventValidator,
  EventController.updateEvent
);
Router.delete(
  "/events/:id",
  authentication,
  authorization([UserRole.ORGANIZER, UserRole.ADMIN]),
  EventController.deleteEvent
);

export { Router as eventRouter };
