import { DataSource } from "typeorm";
import * as dotenv from "dotenv";

dotenv.config();

const { DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, DB_PORT } = process.env;

/** TypeORM CLI entry point (migration:run, migration:revert). */
export default new DataSource({
  type: "postgres",
  host: DB_HOST || "localhost",
  port: Number(DB_PORT) || 5432,
  username: DB_USER || "localhost",
  password: DB_PASSWORD || "Assa@774623",
  database: DB_NAME || "eventify_db",
  logging: false,
  entities: ["src/entity/**/*.ts"],
  migrations: ["src/migration/**/*.ts"],
  synchronize: false,
});
