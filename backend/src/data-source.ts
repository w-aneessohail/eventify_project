import "./config/bootstrap";
import { DataSource } from "typeorm";
import { getDataSourceOptions } from "./config/dataSource.config";

/** TypeORM CLI entry point (migration:run, migration:revert). */
export default new DataSource({
  ...getDataSourceOptions(),
  synchronize: false,
});
