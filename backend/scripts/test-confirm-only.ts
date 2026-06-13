import * as dotenv from "dotenv";
dotenv.config();
import dataSource from "../src/data-source";
import { Booking } from "../src/entity/booking.entity";
import { Event } from "../src/entity/event.entity";
import { User } from "../src/entity/user.entity";
import { Payment } from "../src/entity/payment.entity";
import { BookingService } from "../src/service/booking.service";
import { PaymentService } from "../src/service/payment.service";
import { PaymentMethod } from "../src/enum/paymentMethod.enum";

async function main() {
  await dataSource.initialize();
  const bookingRepo = dataSource.getRepository(Booking);
  const paymentRepo = dataSource.getRepository(Payment);
  const bookingService = new BookingService(bookingRepo);
  const paymentService = new PaymentService(paymentRepo);

  const attendee = await dataSource.getRepository(User).findOne({
    where: { email: "ayesha.siddiqui@eventify.pk" },
  });
  const event = await dataSource.getRepository(Event).findOne({
    where: { title: "Lahore Tech Summit 2026" },
  });

  const created = await bookingService.createForAttendee({
    event: event!,
    attendee: attendee!,
    quantity: 1,
  });
  console.log("booking id:", created.booking?.id);

  const result = await paymentService.confirmPayment({
    bookingId: created.booking!.id,
    attendeeId: attendee!.id,
    method: PaymentMethod.CARD,
  });
  console.log("confirm ok:", result.ok, result.message);

  const row = await dataSource.query(
    'SELECT id, "bookingId", status FROM payments ORDER BY id DESC LIMIT 1'
  );
  console.log("latest payment row:", row);

  await dataSource.destroy();
}

main();
