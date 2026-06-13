import * as dotenv from "dotenv";
dotenv.config();
import dataSource from "../src/data-source";
import { Payment } from "../src/entity/payment.entity";
import { Booking } from "../src/entity/booking.entity";
import { PaymentMethod } from "../src/enum/paymentMethod.enum";
import { PaymentStatus } from "../src/enum/paymentStatus.enum";

async function main() {
  await dataSource.initialize();
  await dataSource.transaction(async (manager) => {
    const booking = await manager.getRepository(Booking).findOne({
      where: { id: 13 },
    });
    const paymentRepo = manager.getRepository(Payment);
    const r = await paymentRepo
      .createQueryBuilder()
      .insert()
      .into(Payment)
      .values({
        amount: 200,
        method: PaymentMethod.CARD,
        status: PaymentStatus.SUCCESS,
        transactionId: "TX_IN_TRANSACTION",
        booking: { id: booking!.id },
      })
      .returning("*")
      .execute();
    console.log("tx insert raw:", JSON.stringify(r.raw, null, 2));
  });
  await dataSource.destroy();
}

main();
