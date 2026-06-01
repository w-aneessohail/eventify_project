import { DataSource } from "typeorm";
import * as dotenv from "dotenv";
dotenv.config();

const { DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, DB_PORT } = process.env;

const baseDataSourceOptions = {
  type: "postgres" as const,
  host: DB_HOST || "localhost",
  port: Number(DB_PORT) || 5432,
  username: DB_USER || "localhost",
  password: DB_PASSWORD || "Assa@774623",
  database: DB_NAME || "eventify_db",
  logging: false,
  entities: ["src/entity/**/*.ts"],
  migrations: ["src/migration/**/*.ts"],
};

export const AppDataSource = new DataSource({
  ...baseDataSourceOptions,
  synchronize: true,
});

/**
 * Existing DBs may have organizer rows without organizerName.
 * TypeORM cannot ADD COLUMN ... NOT NULL in one step — backfill first.
 */
async function ensureOrganizerNameColumn(): Promise<void> {
  const prep = new DataSource({
    ...baseDataSourceOptions,
    synchronize: false,
  });

  await prep.initialize();
  try {
    await prep.query(
      `ALTER TABLE organizers ADD COLUMN IF NOT EXISTS "organizerName" character varying`
    );
    await prep.query(
      `UPDATE organizers
       SET "organizerName" = COALESCE(
         NULLIF(TRIM("organizerName"), ''),
         "organizationName",
         'Organizer'
       )
       WHERE "organizerName" IS NULL`
    );
    await prep.query(
      `ALTER TABLE organizers ALTER COLUMN "organizerName" SET NOT NULL`
    );
  } catch (err) {
    const msg = (err as Error).message ?? "";
    if (!msg.includes("already") && !msg.includes("does not exist")) {
      console.warn("organizerName column prep:", msg);
    }
  } finally {
    await prep.destroy();
  }
}

export const initdatabase = async () => {
  try {
    await ensureOrganizerNameColumn();
    await AppDataSource.initialize();
    console.log("Database connected!");
  } catch (error) {
    console.error("Error initializing database:", error);
    process.exit(1);
  }
};
