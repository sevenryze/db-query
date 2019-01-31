import { IDriver, ITransactionSqlRunner } from "../IDriver";

export interface IPostgresqlDriverOptions {
  type: "postgresql";
}

export class PostgresqlDriver implements IDriver {
  public getPoolSqlRunner(): Promise<ITransactionSqlRunner> {
    throw new Error("Method not implemented.");
  }
  public connect(): Promise<void> {
    throw new Error("Method not implemented.");
  }
  public disconnect(): Promise<void> {
    throw new Error("Method not implemented.");
  }
  public getTransactionSqlRunner(): Promise<ITransactionSqlRunner> {
    throw new Error("Method not implemented.");
  }

  constructor(private options: IPostgresqlDriverOptions) {}
}
