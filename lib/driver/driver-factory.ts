import { Connection } from "../connection/connection";
import { IDriver } from "./Driver";
import { IMongoDriverOptions, MongoDriver } from "./implement/mongo-driver";
import { IMysqlDriverOptions, MysqlDriver } from "./implement/mysql-driver";

/**
 * Creates a new driver depend on a given connection's driver type.
 */
export function driverFactory(connection: Connection, options: IMongoDriverOptions | IMysqlDriverOptions): IDriver {
  switch (options.type) {
    case "mysql":
      return new MysqlDriver(connection, options);

    case "mongodb":
      return new MongoDriver(connection, options);

    default:
      throw new Error();
  }
}
