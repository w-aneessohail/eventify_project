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
  const result = await client.query(
    `SELECT EXISTS (
       SELECT FROM information_schema.tables
       WHERE table_schema = 'public' AND table_name = 'users'
     ) AS "exists"`
  );
  console.log("row:", result.rows[0]);
  console.log("typeof:", typeof result.rows[0].exists);
  console.log("value check !exists:", !result.rows[0]?.exists);
  await client.end();
}

main();
