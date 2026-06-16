import "reflect-metadata";
import "./config/bootstrap";
import * as express from "express";
import * as cors from "cors";
import * as cookieParser from "cookie-parser";
import * as path from "path";
import helmet from "helmet";
import { getConfig } from "./config/env";
import { logger } from "./config/logger";
import { initdatabase } from "./config/dataSource.config";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";
import { userRouter } from "./route/user.route";
import { authRouter } from "./route/auth.route";
import { eventRouter } from "./route/event.route";
import { categoryRouter } from "./route/category.route";
import { eventReviewRouter } from "./route/eventReview.route";
import { bookingRouter } from "./route/booking.route";
import { paymentRouter } from "./route/payment.route";
import { PaymentController } from "./controller/payment.controller";
import { uploadRouter } from "./route/upload.route";
import { approvalRouter } from "./route/approval.route";

const config = getConfig();
const app = express();

if (config.trustProxy) {
  app.set("trust proxy", 1);
}

app.use(
  helmet({
    // CSP omitted — static uploads and Vite dev origins vary; add when frontend is finalized.
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

app.use(cookieParser());

app.use(
  cors({
    origin: config.corsOrigins,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use("/image", express.static(path.join(process.cwd(), "image")));

// Upload routes before JSON parser so multipart bodies are handled by multer.
app.use("/api", uploadRouter);

// Safepay webhook must read the raw body for HMAC signature verification.
app.post(
  "/api/payments/webhook",
  express.raw({ type: "application/json" }),
  PaymentController.handleWebhook
);

app.use(express.json({ limit: config.bodyLimitJson }));
app.use(express.urlencoded({ extended: true, limit: config.bodyLimitUrlencoded }));

app.use("/api", userRouter);
app.use("/api", authRouter);
app.use("/api", eventRouter);
app.use("/api", categoryRouter);
app.use("/api", eventReviewRouter);
app.use("/api", bookingRouter);
app.use("/api", paymentRouter);
app.use("/api", approvalRouter);

app.use(notFoundHandler);
app.use(errorHandler);

initdatabase()
  .then(() => {
    app.listen(config.port, () => {
      logger.info(
        { port: config.port, env: config.nodeEnv },
        "Eventify server started"
      );
    });
  })
  .catch((error) => {
    logger.error({ err: error }, "Failed to initialize database");
    process.exit(1);
  });
