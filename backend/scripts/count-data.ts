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

  const tables = [
    "users",
    "organizers",
    "categories",
    "events",
    "bookings",
    "payments",
    "event_reviews",
    "event_images",
  ];

  console.log("=== CURRENT DATABASE COUNTS ===");
  for (const table of tables) {
    const result = await client.query(
      `SELECT COUNT(*)::int AS count FROM "${table}"`
    );
    console.log(`${table}: ${result.rows[0].count}`);
  }

  await client.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
