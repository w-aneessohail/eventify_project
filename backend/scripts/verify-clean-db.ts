/**
 * Simulates a brand-new developer database setup.
 * DB name must be set in process.env BEFORE loading dataSource.config.
 */
import { Client } from "pg";
import * as dotenv from "dotenv";

dotenv.config();

const TEST_DB = "eventify_verify_empty";

async function dropAndCreateTestDb() {
  const admin = new Client({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: "postgres",
  });

  await admin.connect();

  const exists = await admin.query(
    "SELECT 1 FROM pg_database WHERE datname = $1",
    [TEST_DB]
  );

  if (exists.rowCount) {
    console.log(`Dropping existing test database: ${TEST_DB}`);
    await admin.query(
      `SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = '${TEST_DB}' AND pid <> pg_backend_pid()`
    );
    await admin.query(`DROP DATABASE "${TEST_DB}"`);
  }

  console.log(`Creating empty database: ${TEST_DB}`);
  await admin.query(`CREATE DATABASE "${TEST_DB}"`);
  await admin.end();
}

async function main() {
  await dropAndCreateTestDb();

  // Point app at empty DB before module reads connection options
  process.env.DB_NAME = TEST_DB;

  const { initdatabase, AppDataSource } = await import(
    "../src/config/dataSource.config"
  );

  console.log("Running initdatabase() on empty DB...");
  await initdatabase();

  const verify = new Client({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: TEST_DB,
  });
  await verify.connect();

  const tables = await verify.query(
    `SELECT table_name FROM information_schema.tables
     WHERE table_schema = 'public' ORDER BY table_name`
  );
  const migrations = await verify.query(
    "SELECT name FROM migrations ORDER BY id"
  );

  console.log("=== CLEAN DB TABLES ===");
  console.log(tables.rows.map((r) => r.table_name).join(", "));
  console.log("=== CLEAN DB MIGRATIONS ===");
  console.log(migrations.rows.map((r) => r.name).join(", "));

  const required = [
    "users",
    "organizers",
    "events",
    "bookings",
    "payments",
    "migrations",
  ];
  const created = tables.rows.map((r) => r.table_name);
  const missing = required.filter((t) => !created.includes(t));

  await verify.end();
  if (AppDataSource.isInitialized) {
    await AppDataSource.destroy();
  }

  if (missing.length) {
    throw new Error(`Missing tables after bootstrap: ${missing.join(", ")}`);
  }
  if (!migrations.rows.length) {
    throw new Error("No migrations recorded after bootstrap");
  }

  console.log("CLEAN_DB_TEST: SUCCESS");
}

main().catch((err) => {
  console.error("CLEAN_DB_TEST: FAILED", err.message || err);
  process.exit(1);
});
