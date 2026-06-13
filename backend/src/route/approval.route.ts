import * as express from "express";
import { ApprovalController } from "../controller/approval.controller";
import { authentication } from "../middleware/authentication";
import { authorization } from "../middleware/authorization";
import { UserRole } from "../enum/userRole.enum";

const Router = express.Router();

Router.post(
  "/organizers/:id/approve",
  authentication,
  authorization([UserRole.ADMIN]),
  ApprovalController.approveOrganizer
);
Router.post(
  "/organizers/:id/reject",
  authentication,
  authorization([UserRole.ADMIN]),
  ApprovalController.rejectOrganizer
);
Router.post(
  "/events/:id/approve",
  authentication,
  authorization([UserRole.ADMIN]),
  ApprovalController.approveEvent
);
Router.post(
  "/events/:id/reject",
  authentication,
  authorization([UserRole.ADMIN]),
  ApprovalController.rejectEvent
);

export { Router as approvalRouter };
