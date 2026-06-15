/**
 * Database integrity checks for QA.
 * Usage: npx ts-node scripts/verify-db-integrity.ts
 */
import dataSource from "../src/data-source";
import { Event } from "../src/entity/event.entity";
import { Payment } from "../src/entity/payment.entity";
import { Booking } from "../src/entity/booking.entity";
import { BookingStatus } from "../src/enum/bookingStatus.enum";
import { PaymentStatus } from "../src/enum/paymentStatus.enum";

function assert(condition: boolean, message: string) {
  if (!condition) throw new Error(message);
}

async function main() {
  await dataSource.initialize();

  const eventRepo = dataSource.getRepository(Event);
  const paymentRepo = dataSource.getRepository(Payment);
  const bookingRepo = dataSource.getRepository(Booking);

  const negativeTickets = await eventRepo
    .createQueryBuilder("event")
    .where("event.availableTickets < 0")
    .getCount();
  assert(negativeTickets === 0, `Found ${negativeTickets} events with negative tickets`);
  console.log("✓ No negative availableTickets");

  const payments = await paymentRepo.find({ relations: ["booking"] });
  const orphanPayments = payments.filter((p) => !p.booking?.id);
  assert(orphanPayments.length === 0, `Found ${orphanPayments.length} orphan payments`);
  console.log("✓ No orphan payments");

  const successWithoutConfirmed = await bookingRepo
    .createQueryBuilder("booking")
    .innerJoin("booking.payment", "payment")
    .where("payment.status = :ps", { ps: PaymentStatus.SUCCESS })
    .andWhere("booking.status != :bs", { bs: BookingStatus.CONFIRMED })
    .getCount();
  assert(
    successWithoutConfirmed === 0,
    `Found ${successWithoutConfirmed} SUCCESS payments with non-confirmed bookings`
  );
  console.log("✓ Payment/booking status alignment");

  const confirmedWithoutPayment = await bookingRepo
    .createQueryBuilder("booking")
    .leftJoin("booking.payment", "payment")
    .where("booking.status = :bs", { bs: BookingStatus.CONFIRMED })
    .andWhere("(payment.id IS NULL OR payment.status != :ps)", {
      ps: PaymentStatus.SUCCESS,
    })
    .getCount();
  assert(
    confirmedWithoutPayment === 0,
    `Found ${confirmedWithoutPayment} confirmed bookings without SUCCESS payment`
  );
  console.log("✓ Confirmed bookings have successful payments");

  console.log("\nVERIFY DB INTEGRITY: SUCCESS");
  await dataSource.destroy();
}

main().catch(async (err) => {
  console.error("VERIFY DB INTEGRITY: FAILED");
  console.error(err?.message || err);
  try {
    await dataSource.destroy();
  } catch {
    /* ignore */
  }
  process.exit(1);
});
