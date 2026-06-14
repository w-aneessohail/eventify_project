import * as express from "express";
import { AuthController } from "../controller/auth.controller";
import { authentication } from "../middleware/authentication";
import { authRateLimiter } from "../middleware/rateLimit";
import { LoginValidator } from "../middleware/validator/login.validator";
import { RegisterValidator } from "../middleware/validator/register.validator";
import { VerifyOtpValidator } from "../middleware/validator/verifyOtp.validator";
import { ForgotPasswordValidator } from "../middleware/validator/forgotPassword.validator";
import { ResetPasswordValidator } from "../middleware/validator/resetPassword.validator";

const Router = express.Router();

Router.post("/login", authRateLimiter, LoginValidator, AuthController.loginUser);
Router.post(
  "/register",
  authRateLimiter,
  RegisterValidator,
  AuthController.registerUser
);
Router.post(
  "/verify-otp",
  authRateLimiter,
  VerifyOtpValidator,
  AuthController.verifyOtp
);
Router.post(
  "/forgot-password",
  authRateLimiter,
  ForgotPasswordValidator,
  AuthController.forgotPassword
);
Router.post(
  "/reset-password",
  authRateLimiter,
  ResetPasswordValidator,
  AuthController.resetPassword
);
Router.post("/refresh-token", authRateLimiter, AuthController.refreshToken);
Router.post("/logout", authentication, AuthController.logoutUser);

export { Router as authRouter };
