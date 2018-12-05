import { IDriver } from "../driver/driver";
import { driverFactory } from "../driver/driver-factory";
import { IMysqlDriverOptions } from "../driver/implement/mysql-driver";
import { ILogger } from "../logger/Logger";
import { loggerFactory, LoggerOptions, LoggerType } from "../logger/logger-factory";
import { IQueryRunner, ITransactionQueryRunner } from "../query-runner/query-runner";

export interface IConnectionOptions {
  readonly driver: IMysqlDriverOptions;

  /**
   * Connection name. If connection name is not given then it will be called "default".
   * Different connections must have different names.
   */
  readonly name?: string;

  /**
   * Logging options.
   */
  readonly logOptions?: LoggerOptions;

  /**
   * Logger instance used to log queries and events in the ORM.
   */
  readonly loggerType?: LoggerType;

  /**
   * Maximum number of milliseconds query should be executed before logger log a warning.
   */
  readonly maxQueryExecutionTime?: number;
}

/**
 * Connection is a single database ORM connection to a specific database.
 *
 * **Note:** The Connection may holds a pool of underlay connection.
 *
 * You can have multiple `Connections` to multiple databases in your application.
 */
export class Connection {
  /**
   * Connection name.
   */
  public readonly name: string;

  /**
   * Database driver used by this Connection.
   */
  public readonly driver: IDriver;

  /**
   * Logger used to log orm events.
   */
  public readonly logger: ILogger;

  /**
   * Maximum number of milliseconds query should be executed before logger log a warning.
   */
  public readonly maxQueryExecutionTime: number = 60 * 1000;

  get isConnected() {
    return this.isDriverConnected;
  }

  /**
   * Performs Connection to the database.
   * This method should be called once on application bootstrap.
   * This method not necessarily creates database Connection (depend on database type),
   * but it also can setup a Connection Connection with database to use.
   */
  public async open(): Promise<this> {
    if (this.isDriverConnected) {
      throw new Error(this.name);
    }

    // connect to the database via its driver
    await this.driver.connect();

    // set connected status for the current Connection
    this.isDriverConnected = true;

    return this;
  }

  /**
   * Closes Connection with the database.
   * Once Connection is closed, you cannot use repositories or perform any operations except opening Connection again.
   */
  public async close(): Promise<void> {
    if (!this.isDriverConnected) {
      throw new Error(this.name);
    }

    await this.driver.disconnect();

    this.isDriverConnected = false;
  }

  public getQueryRunner(): Promise<IQueryRunner> {
    return this.driver.createQueryRunner();
  }

  public getTransactionQueryRunner(): Promise<ITransactionQueryRunner> {
    return this.driver.createQueryRunner(true) as Promise<ITransactionQueryRunner>;
  }

  constructor(options: IConnectionOptions) {
    this.name = options.name || "default";

    this.maxQueryExecutionTime = options.maxQueryExecutionTime || this.maxQueryExecutionTime;
    this.logger = loggerFactory(this, options.loggerType, options.logOptions);
    this.driver = driverFactory(this, options.driver);
  }

  /**
   * Indicates if Connection is initialized or not.
   */
  private isDriverConnected = false;
}
