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

  const migrations = await client.query(
    "SELECT id, timestamp, name FROM migrations ORDER BY id"
  );
  const indexes = await client.query(
    `SELECT indexname, indexdef FROM pg_indexes
     WHERE schemaname = 'public' AND tablename IN ('organizers', 'payments')
     ORDER BY indexname`
  );
  const organizerCol = await client.query(
    `SELECT column_name, is_nullable FROM information_schema.columns
     WHERE table_name = 'organizers' AND column_name = 'organizerName'`
  );
  const tables = await client.query(
    `SELECT table_name FROM information_schema.tables
     WHERE table_schema = 'public' ORDER BY table_name`
  );

  console.log("=== MIGRATIONS ===");
  console.log(JSON.stringify(migrations.rows, null, 2));

  console.log("=== INDEXES (organizers, payments) ===");
  console.log(JSON.stringify(indexes.rows, null, 2));

  console.log("=== ORGANIZER NAME COLUMN ===");
  console.log(JSON.stringify(organizerCol.rows, null, 2));

  console.log("=== TABLES ===");
  console.log(tables.rows.map((r) => r.table_name).join(", "));

  await client.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
