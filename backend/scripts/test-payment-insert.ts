import * as dotenv from "dotenv";
dotenv.config();
import dataSource from "../src/data-source";
import { Payment } from "../src/entity/payment.entity";
import { Booking } from "../src/entity/booking.entity";
import { PaymentMethod } from "../src/enum/paymentMethod.enum";
import { PaymentStatus } from "../src/enum/paymentStatus.enum";

async function main() {
  await dataSource.initialize();
  const booking = await dataSource.getRepository(Booking).findOne({
    where: { id: 16 },
  });
  const repo = dataSource.getRepository(Payment);
  const r = await repo
    .createQueryBuilder()
    .insert()
    .into(Payment)
    .values({
      amount: 100,
      method: PaymentMethod.CARD,
      status: PaymentStatus.PENDING,
      transactionId: "TEST_INSERT",
      booking: { id: booking!.id },
    })
    .returning("*")
    .execute();
  console.log("insert raw:", JSON.stringify(r.raw, null, 2));
  await dataSource.destroy();
}

main();
