import { driverFactory, IDriverOptions } from "../driver/driver-factory";
import { IDriver, IPoolSqlRunner } from "../driver/IDriver";
import { IQueryHook } from "../IQueryHook";

export interface IConnectionOptions {
  /**
   * `Connection` name. If connection name is not given then it will be called "default".
   *
   * Different connections **MUST** have different names.
   */
  name?: string;

  /**
   * The underlay db driver used by us.
   *
   * Currently we use `node-mysql` for mysql and `postgres` for postgresql.
   */
  driver: IDriverOptions;

  /**
   * Hooks performed on query events.
   */
  hooks?: IQueryHook[];

  /**
   * Maximum number of milliseconds query should be executed before terminating this query.
   */
  maxQueryExecutionThreshold?: number;

  slowQueryThreshold?: number;
}

/**
 * `Connection` is a single database ORM connection to a specific database.
 *
 * **Note:** The `Connection` may holds a pool of underlay raw connections.
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
   * Once `Connection` closed, you cannot use repositories or perform any operations except opening Connection again.
   */
  public async close(): Promise<void> {
    if (!this.isDriverConnected) {
      throw new Error(this.name);
    }

    await this.driver.disconnect();

    this.isDriverConnected = false;
  }

  public async getQueryRunner(): Promise<IQueryRunner> {
    return this.hookedSqlRunner(await this.driver.getPoolSqlRunner());
  }

  public async getTransactionQueryRunner(): Promise<ITransactionQueryRunner> {
    const sqlRunner = this.hookedSqlRunner(await this.driver.getTransactionSqlRunner());

    const startTransaction = async (): Promise<void> => {
      await sqlRunner.run(`START TRANSACTION`);
    };
    const commitTransaction = async (): Promise<void> => {
      await sqlRunner.run(`COMMIT`);
    };
    const rollbackTransaction = async (): Promise<void> => {
      await sqlRunner.run(`ROLLBACK`);
    };

    return { commitTransaction, release: sqlRunner.release, rollbackTransaction, run: sqlRunner.run, startTransaction };
  }

  constructor(options: IConnectionOptions) {
    this.name = options.name || "default";

    this.maxQueryExecutionThreshold = options.maxQueryExecutionThreshold || this.maxQueryExecutionThreshold;
    this.slowQueryThreshold = options.slowQueryThreshold || this.slowQueryThreshold;
    this.hooks = options.hooks;
    this.driver = driverFactory(options.driver);
  }

  /**
   * Database driver used by this Connection.
   */
  private readonly driver: IDriver;

  /**
   * Logger used to log orm events.
   */
  private readonly hooks?: IQueryHook[];

  /**
   * Maximum number of milliseconds query should be executed before logger log a warning.
   */
  private readonly maxQueryExecutionThreshold: number = 60 * 1000;

  private readonly slowQueryThreshold: number = 6 * 1000;

  /**
   * Indicates if Connection is initialized or not.
   */
  private isDriverConnected = false;

  private hookedSqlRunner<T extends IPoolSqlRunner>(sqlRunner: T): T {
    const hookedRunner = async (sql: string, values?: any[]) => {
      this.applyHooks(hook => hook.onQuery(sql, values));

      const queryStartTime = Date.now();
      // TODO: Use maxQueryExecutionTime to terminate long running queries.
      const result = await sqlRunner.run(sql, values);
      const queryEndTime = Date.now();

      const queryTime = queryEndTime - queryStartTime;
      if (queryTime > this.slowQueryThreshold) {
        this.applyHooks(hook => hook.onSlow(queryTime, sql, values));
      }

      return result;
    };

    return {
      ...sqlRunner,
      run: hookedRunner,
    };
  }

  private applyHooks(method: (hook: IQueryHook) => void) {
    this.hooks && this.hooks.forEach(method);
  }
}

export interface IQueryRunner extends IPoolSqlRunner {}

export interface ITransactionQueryRunner extends IQueryRunner {
  startTransaction(isolationLevel?: string): Promise<void>;

  commitTransaction(): Promise<void>;

  rollbackTransaction(): Promise<void>;

  release(): Promise<void>;
}
