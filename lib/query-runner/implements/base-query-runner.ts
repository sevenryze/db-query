import { Connection } from "../../connection/connection";

export abstract class BaseQueryRunner {
  public async query(sqlString: string, values?: any[]) {
    const logger = this.connection.logger;

    logger.logQuery(sqlString, values);
    const queryStartTime = Date.now();
    const result = await this.driverQueryRunner.query(sqlString, values);
    const queryEndTime = Date.now();
    const queryTime = queryEndTime - queryStartTime;

    if (queryTime > this.connection.maxQueryExecutionTime) {
      logger.logQuerySlow(queryTime, sqlString, values);
    }

    return result;
  }

  constructor(protected driverQueryRunner: any, protected connection: Connection) {}
}
