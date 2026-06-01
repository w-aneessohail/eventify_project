import * as express from "express";
import { AuthController } from "../controller/auth.controller";
import { authentication } from "../middleware/authentication";
import { LoginValidator } from "../middleware/validator/login.validator";
import { RegisterValidator } from "../middleware/validator/register.validator";
import { VerifyOtpValidator } from "../middleware/validator/verifyOtp.validator";

const Router = express.Router();

Router.post("/login", LoginValidator, AuthController.loginUser);

Router.post("/register", RegisterValidator, AuthController.registerUser);

Router.post("/verify-otp", VerifyOtpValidator, AuthController.verifyOtp);

Router.post("/forgot-password", AuthController.forgotPassword);

Router.post("/reset-password", AuthController.resetPassword);

Router.post("/refresh-token", AuthController.refreshToken);

Router.post("/logout", authentication, AuthController.logoutUser);

export { Router as authRouter };
