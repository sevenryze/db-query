import { Connection } from "../connection/connection";
import { PoolQueryRunner } from "./implements/pool-query-runner";
import { TransactionQueryRunner } from "./implements/transaction-query-runner";

export function queryRunnerFactory(connection: Connection, queryIssuer: any, isTransaction?: boolean) {
  if (isTransaction) {
    return new TransactionQueryRunner(connection, queryIssuer);
  } else {
    return new PoolQueryRunner(connection, queryIssuer);
  }
}
