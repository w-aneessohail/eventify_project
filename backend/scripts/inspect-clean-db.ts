import { Client } from "pg";
import * as dotenv from "dotenv";

dotenv.config();

async function main() {
  const client = new Client({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: "eventify_verify_empty",
  });
  await client.connect();
  const tables = await client.query(
    `SELECT table_name FROM information_schema.tables WHERE table_schema='public' ORDER BY table_name`
  );
  console.log("TABLES:", tables.rows.map((r) => r.table_name).join(", ") || "(none)");
  await client.end();
}

main().catch(console.error);
