import { DataSource } from "typeorm";
import { getConfig } from "./env";
import { logger } from "./logger";

export function getDataSourceOptions() {
  const { db } = getConfig();
  return {
    type: "postgres" as const,
    host: db.host,
    port: db.port,
    username: db.user,
    password: db.password,
    database: db.name,
    logging: false,
    entities: ["src/entity/**/*.ts"],
    migrations: ["src/migration/**/*.ts"],
  };
}

export const AppDataSource = new DataSource({
  ...getDataSourceOptions(),
  synchronize: false,
  migrationsRun: true,
});

/** One-time schema creation for empty databases (replaces permanent synchronize). */
async function bootstrapSchemaIfEmpty(): Promise<void> {
  const prep = new DataSource({
    ...getDataSourceOptions(),
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
      logger.info("Empty database detected — running one-time schema bootstrap");
      await prep.destroy();

      const bootstrap = new DataSource({
        ...getDataSourceOptions(),
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
    logger.info("Database connected");
  } catch (error) {
    logger.error({ err: error }, "Error initializing database");
    process.exit(1);
  }
};
