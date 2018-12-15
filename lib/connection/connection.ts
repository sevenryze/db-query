import { IDriver } from "../driver/driver";
import { driverFactory, IDriverOptions } from "../driver/driver-factory";
import { ILogger } from "../logger/Logger";
import { ILoggerOptions, loggerFactory } from "../logger/logger-factory";

export interface IConnectionOptions {
  /**
   * Connection name. If connection name is not given then it will be called "default".
   * Different connections must have different names.
   */
  readonly name?: string;

  readonly driver: IDriverOptions;

  /**
   * Logging options.
   */
  readonly logger?: ILoggerOptions;

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

  get isConnected() {
    return this.isDriverConnected;
  }

  /**
   * Performs Connection to the database.
   * This method should be called once on application bootstrap.
   * This method not necessarily creates database Connection (depend on database type),
   * but it also can setup a Connection Connection with database to use.
   */
  public open = async (): Promise<this> => {
    if (this.isDriverConnected) {
      throw new Error(this.name);
    }

    // connect to the database via its driver
    await this.driver.connect();

    // set connected status for the current Connection
    this.isDriverConnected = true;

    return this;
  };

  /**
   * Closes Connection with the database.
   * Once Connection is closed, you cannot use repositories or perform any operations except opening Connection again.
   */
  public close = async (): Promise<void> => {
    if (!this.isDriverConnected) {
      throw new Error(this.name);
    }

    await this.driver.disconnect();

    this.isDriverConnected = false;
  };

  public getQueryRunner = async (): Promise<IQueryRunner> => {
    const sqlRunner = await this.loggerWrapperSqlRunner();

    const filterdSqlRunner = async (sql: string, values?: any[]) => {
      const result = await sqlRunner.run(sql, values);
      await sqlRunner.release();

      return result;
    };

    return { run: filterdSqlRunner };
  };

  public getTransactionQueryRunner = async (): Promise<ITransactionQueryRunner> => {
    const {
      commitTransaction,
      run,
      rollbackTransaction,
      startTransaction,
      release,
    } = await this.loggerWrapperSqlRunner();

    return { commitTransaction, release, rollbackTransaction, run, startTransaction };
  };

  constructor(options: IConnectionOptions) {
    this.name = options.name || "default";

    this.maxQueryExecutionTime = options.maxQueryExecutionTime || this.maxQueryExecutionTime;
    this.logger = loggerFactory(options.logger!);
    this.driver = driverFactory(options.driver);
  }

  /**
   * Database driver used by this Connection.
   */
  private readonly driver: IDriver;

  /**
   * Logger used to log orm events.
   */
  private readonly logger: ILogger;

  /**
   * Maximum number of milliseconds query should be executed before logger log a warning.
   */
  private readonly maxQueryExecutionTime: number = 60 * 1000;

  /**
   * Indicates if Connection is initialized or not.
   */
  private isDriverConnected = false;

  private loggerWrapperSqlRunner = async () => {
    const logger = this.logger;
    const maxQueryExecutionTime = this.maxQueryExecutionTime;
    const sqlRunner = await this.driver.createSqlRunner();

    const run = async (sql: string, values?: any[]) => {
      logger.logQuery(sql, values);
      
      const queryStartTime = Date.now();
      const result = await sqlRunner.run(sql, values);
      const queryEndTime = Date.now();

      const queryTime = queryEndTime - queryStartTime;
      if (queryTime > maxQueryExecutionTime) {
        logger.logQuerySlow(queryTime, sql, values);
      }

      return result;
    };
    const release = () => {
      return sqlRunner.release();
    };
    const startTransaction = (): Promise<void> => {
      return run(`START TRANSACTION`);
    };
    const commitTransaction = (): Promise<void> => {
      return run(`COMMIT`);
    };
    const rollbackTransaction = (): Promise<void> => {
      return run(`ROLLBACK`);
    };

    return { commitTransaction, release, rollbackTransaction, run, startTransaction };
  };
}

export interface IQueryRunner {
  run(sqlString: string, values?: any[]): Promise<any>;
}

export interface ITransactionQueryRunner extends IQueryRunner {
  startTransaction(isolationLevel?: string): Promise<void>;

  commitTransaction(): Promise<void>;

  rollbackTransaction(): Promise<void>;

  release(): Promise<void>;
}
