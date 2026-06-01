import { AppDataSource } from "../config/dataSource.config";
import { User } from "../entity/user.entity";
import { Organizer } from "../entity/organizer.entity";
import { OtpToken } from "../entity/otpToken.entity";
import { UserService } from "../service/user.service";
import { OrganizerService } from "../service/organizer.service";
import { OtpTokenService } from "../service/otpToken.service";
import { AuthTokenService } from "../service/authToken.service";
import { AuthToken } from "../entity/authToken.entity";
import { EventService } from "../service/event.service";
import { Event } from "../entity/event.entity";
import { EventImageService } from "../service/eventImage.service";
import { EventImage } from "../entity/eventImage.entity";
import { CategoryService } from "../service/category.service";
import { Category } from "../entity/category.entity";
import { EventReviewService } from "../service/eventReview.service";
import { EventReview } from "../entity/eventReview.entity";
import { BookingService } from "../service/booking.service";
import { Booking } from "../entity/booking.entity";
import { Payment } from "../entity/payment.entity";
import { PaymentService } from "../service/payment.service";

export const userRepository = new UserService(
  AppDataSource.getRepository(User)
);

export const organizerRepository = new OrganizerService(
  AppDataSource.getRepository(Organizer)
);

export const otpTokenRepository = new OtpTokenService(
  AppDataSource.getRepository(OtpToken)
);

export const authTokenRepository = new AuthTokenService(
  AppDataSource.getRepository(AuthToken)
);

export const eventRepository = new EventService(
  AppDataSource.getRepository(Event)
);

export const eventImageRepository = new EventImageService(
  AppDataSource.getRepository(EventImage)
);

export const categoryRepository = new CategoryService(
  AppDataSource.getRepository(Category)
);

export const eventReviewRepository = new EventReviewService(
  AppDataSource.getRepository(EventReview)
);

export const bookingRepository = new BookingService(
  AppDataSource.getRepository(Booking)
);

export const paymentRepository = new PaymentService(
  AppDataSource.getRepository(Payment)
);
