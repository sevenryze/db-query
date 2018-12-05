import { Connection } from "../../connection/connection";
import { ITransactionQueryRunner } from "../query-runner";
import { BaseQueryRunner } from "./base-query-runner";

export class TransactionQueryRunner extends BaseQueryRunner implements ITransactionQueryRunner {
  public async startTransaction(isolationLevel?: string) {
    await this.driverQueryRunner.query(isolationLevel);
  }
  public async commitTransaction() {
    await this.driverQueryRunner.query(`COMMIT`);
    await this.releaseConnection();
  }
  public async rollbackTransaction() {
    await this.driverQueryRunner.query(`ROLLBACK`);
    await this.releaseConnection();
  }

  constructor(driverQueryRunner: any, connection: Connection) {
    super(driverQueryRunner, connection);
  }

  private releaseConnection() {
    this.driverQueryRunner.release();
  }
}
