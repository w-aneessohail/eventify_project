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

  const result = await client.query(
    `DELETE FROM migrations WHERE name = 'TestGenerate1781353701687' RETURNING name`
  );

  console.log(
    result.rowCount
      ? `Removed orphaned migration: ${result.rows[0].name}`
      : "No orphaned TestGenerate migration found"
  );

  await client.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
