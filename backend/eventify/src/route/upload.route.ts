import * as express from "express";
import { UploadController } from "../controller/upload.controller";
import { authentication } from "../middleware/authentication";
import { authorization } from "../middleware/authorization";
import { UserRole } from "../enum/userRole.enum";
import { uploadProfileImage, uploadEventImages } from "../helper/multer.helper";

const Router = express.Router();

Router.post(
  "/upload/profile",
  authentication,
  uploadProfileImage.single("profileImage"),
  UploadController.uploadProfileImage
);

Router.post(
  "/upload/eventImage",
  authentication,
  authorization([UserRole.ORGANIZER, UserRole.ADMIN]),
  uploadEventImages.single("eventImage"),
  UploadController.uploadEventImage
);

Router.post(
  "/upload/eventImages",
  authentication,
  authorization([UserRole.ORGANIZER, UserRole.ADMIN]),
  uploadEventImages.array("eventImages", 10),
  UploadController.uploadEventImages
);

export { Router as uploadRouter };
