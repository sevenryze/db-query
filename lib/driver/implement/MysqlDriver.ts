import mysql from "mysql";
import { IDriver, IPoolSqlRunner, ITransactionSqlRunner } from "../IDriver";

export interface IMysqlDriverOptions extends mysql.PoolConfig {
  type: "mysql";
}

/**
 * Organizes communication with MySQL DBMS.
 */
export class MysqlDriver implements IDriver {
  public async getPoolSqlRunner(): Promise<IPoolSqlRunner> {
    const run = (sql: string, values: any[]): Promise<any> => {
      return new Promise((resolve, reject) => {
        this.pool!.query(sql, values, (error, results, fieldsInfo) => {
          if (error) {
            return reject(error);
          }

          resolve({
            fieldsInfo,
            results,
          });
        });
      });
    };

    return { run };
  }

  public async getTransactionSqlRunner(): Promise<ITransactionSqlRunner> {
    const connection: mysql.PoolConnection = await this.getConnection();

    const run = (sql: string, values: any[]): Promise<any> => {
      return new Promise((resolve, reject) => {
        connection.query(sql, values, (error, results, fieldsInfo) => {
          if (error) {
            return reject(error);
          }

          resolve({
            fieldsInfo,
            results,
          });
        });
      });
    };

    const release = (): Promise<void> => {
      return new Promise((resolve, reject) => {
        connection.release();
        resolve();
      });
    };

    return { release, run };
  }

  /**
   * Performs connection to the database.
   */
  public connect(): Promise<void> {
    return this.createPool(this.options);
  }

  /**
   * Closes connection with the database.
   */
  public disconnect(): Promise<void> {
    return this.closePool();
  }

  constructor(private options: IMysqlDriverOptions) {}

  private pool?: mysql.Pool;

  /**
   * Creates a new connection pool for a given database credentials.
   */
  private createPool(options: mysql.PoolConfig): Promise<void> {
    // make sure connection is working fine
    return new Promise((resolve, reject) => {
      if (this.pool) {
        return resolve();
      }

      // create a connection pool
      const pool = mysql.createPool(options);

      // we make first connection to database to make sure if connection credentials are wrong
      // we give error before calling any other method that creates actual query runner
      pool.getConnection((err, connection) => {
        if (err) {
          return pool.end(() => reject(err));
        }

        connection.release();

        this.pool = pool;
        resolve();
      });
    });
  }

  private closePool(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.pool) {
        return resolve();
      }

      this.pool.end((err: any) => {
        if (err) {
          return reject(err);
        }
        this.pool = undefined;
        resolve();
      });
    });
  }

  private getConnection(): Promise<mysql.PoolConnection> {
    return new Promise((resolve, reject) => {
      if (!this.pool) {
        return reject(`Database connection pool does not exist.`);
      }

      this.pool.getConnection((error, connection) => {
        if (error) {
          return reject(error);
        }

        resolve(connection);
      });
    });
  }
}
