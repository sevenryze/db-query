export interface ISqlRunner {
  run(sqlString: string, values?: any[]): Promise<any>;

  release(): Promise<void>;
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
   * Create a single sql executor.
   */
  createSqlRunner(): Promise<ISqlRunner>;
}
