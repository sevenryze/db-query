import { IDriver } from "./Driver";
import { IMysqlDriverOptions, MysqlDriver } from "./implement/mysql-driver";
import { IPostgresqlDriverOptions, PostgresqlDriver } from "./implement/postgresql-driver";

export type IDriverOptions = IMysqlDriverOptions | IPostgresqlDriverOptions;

/**
 * Creates a new driver depend on a given connection's driver type.
 */
export function driverFactory(options: IDriverOptions): IDriver {
  switch (options.type) {
    case "mysql":
      return new MysqlDriver(options);

    case "postgresql":
      return new PostgresqlDriver(options);

    default:
      throw new Error();
  }
}
