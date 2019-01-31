export interface ITransactionSqlRunner extends IPoolSqlRunner {
  release(): Promise<void>;
}

export interface IPoolSqlRunner {
  run(
    sqlString: string,
    values?: any[]
  ): Promise<{
    fieldsInfo: any;
    results: any[];
  }>;
}

/**
 * Driver organizes myorm communication with specific database management system.
 */
export interface IDriver {
  /**
   * Performs connection to the database.
   * Depend on driver type it almostly create a client pool.
   */
  connect(): Promise<void>;

  /**
   * Closes connection with database and releases all resources.
   */
  disconnect(): Promise<void>;

  /**
   * Create a single sql runner.
   */
  getTransactionSqlRunner(): Promise<ITransactionSqlRunner>;

  /**
   * Create a pooled sql runner.
   */
  getPoolSqlRunner(): Promise<IPoolSqlRunner>;
}
