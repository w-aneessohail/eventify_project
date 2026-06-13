import { Client } from "pg";
import * as dotenv from "dotenv";
dotenv.config();

async function main() {
  const client = new Client({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });
  await client.connect();
  const r = await client.query(
    'SELECT id, status, "bookingId", amount FROM payments ORDER BY id DESC LIMIT 5'
  );
  console.log(r.rows);
  const b = await client.query(
    'SELECT id, status, quantity FROM bookings ORDER BY id DESC LIMIT 5'
  );
  console.log(b.rows);
  await client.end();
}

main();
