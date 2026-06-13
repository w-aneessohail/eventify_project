import { DataSource } from "typeorm";
import * as dotenv from "dotenv";
dotenv.config();

const { DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, DB_PORT } = process.env;

export const baseDataSourceOptions = {
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
  synchronize: false,
  migrationsRun: true,
});

/** One-time schema creation for empty databases (replaces permanent synchronize). */
async function bootstrapSchemaIfEmpty(): Promise<void> {
  const prep = new DataSource({
    ...baseDataSourceOptions,
    synchronize: false,
  });

  await prep.initialize();
  try {
    const result = await prep.query(
      `SELECT EXISTS (
         SELECT FROM information_schema.tables
         WHERE table_schema = 'public' AND table_name = 'users'
       ) AS "exists"`
    );

    if (!result[0]?.exists) {
      console.log(
        "Empty database detected — running one-time schema bootstrap..."
      );
      await prep.destroy();

      const bootstrap = new DataSource({
        ...baseDataSourceOptions,
        synchronize: true,
      });
      await bootstrap.initialize();
      await bootstrap.destroy();
      return;
    }
  } finally {
    if (prep.isInitialized) {
      await prep.destroy();
    }
  }
}

export const initdatabase = async () => {
  try {
    await bootstrapSchemaIfEmpty();
    await AppDataSource.initialize();
    console.log("Database connected!");
  } catch (error) {
    console.error("Error initializing database:", error);
    process.exit(1);
  }
};
