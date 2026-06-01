import * as express from "express";
import { UserController } from "../controller/user.controller";
import { authentication } from "../middleware/authentication";
import { authorization } from "../middleware/authorization";
import { UserRole } from "../enum/userRole.enum";
import { CreateUserValidator } from "../middleware/validator/createUser.validator";

const Router = express.Router();

Router.get(
  "/users",
  authentication,
  authorization([UserRole.ADMIN]),
  UserController.getAllUsers
);
Router.get("/users/:id", authentication, UserController.getUserById);
Router.post(
  "/users",
  authentication,
  authorization([UserRole.ADMIN]),
  CreateUserValidator,
  UserController.createUser
);
Router.put("/users/:id", authentication, UserController.updateUser);
Router.delete(
  "/users/:id",
  authentication,
  authorization([UserRole.ADMIN]),
  UserController.deleteUser
);
Router.get("/profile", authentication, UserController.getLoggedInUser);

export { Router as userRouter };
