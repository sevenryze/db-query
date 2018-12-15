import { IDriver, ISqlRunner } from "../Driver";

export interface IPostgresqlDriverOptions {
  type: "postgresql";
}

export class PostgresqlDriver implements IDriver {
  public connect(): Promise<void> {
    throw new Error("Method not implemented.");
  }
  public disconnect(): Promise<void> {
    throw new Error("Method not implemented.");
  }
  public createSqlRunner(): Promise<ISqlRunner> {
    throw new Error("Method not implemented.");
  }

  constructor(private options: IPostgresqlDriverOptions) {}
}
