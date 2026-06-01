import "reflect-metadata";
import * as express from "express";
import * as dotenv from "dotenv";
import * as cors from "cors";
import * as cookieParser from "cookie-parser";
import * as path from "path";
import { userRouter } from "./route/user.route";
import { authRouter } from "./route/auth.route";
import { initdatabase } from "./config/dataSource.config";
import { eventRouter } from "./route/event.route";
import { categoryRouter } from "./route/category.route";
import { eventReviewRouter } from "./route/eventReview.route";
import { bookingRouter } from "./route/booking.route";
import { paymentRouter } from "./route/payment.route";
import { uploadRouter } from "./route/upload.route";

dotenv.config();

const app = express();
const PORT = process.env.PORT || "3000";
app.use(cookieParser());

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(cookieParser());
app.use("/image", express.static(path.join(process.cwd(), "image")));

app.use("/api", uploadRouter);
app.use(express.json());

app.use("/api", userRouter);
app.use("/api", authRouter);
app.use("/api", eventRouter);
app.use("/api", categoryRouter);
app.use("/api", eventReviewRouter);
app.use("/api", bookingRouter);
app.use("/api", paymentRouter);

initdatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Failed to initialize database:", error);
  });
