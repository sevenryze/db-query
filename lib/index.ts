import { Connection, IConnectionOptions } from "./connection/connection";
import { defaultConnectionManager } from "./connection/connection-manager";
import { IQueryRunner } from "./query-runner/query-runner";
export { IQueryRunner, ITransactionQueryRunner } from "./query-runner/query-runner";

export function getTransactionQueryRunner(connectionName: string = "default") {
  return defaultConnectionManager.get(connectionName).getTransactionQueryRunner();
}

export function getQueryRunner(connectionName: string = "default") {
  return defaultConnectionManager.get(connectionName).getQueryRunner();
}

export function getConnection(connectionName: string = "default") {
  return defaultConnectionManager.get(connectionName);
}

export async function createConnection(options: IConnectionOptions): Promise<Connection> {
  const connection = defaultConnectionManager.create(options);

  await connection.open();

  return connection;
}

export function getConnectionManager() {
  return defaultConnectionManager;
}

interface IRepositoryConstructor<T> {
  new (queryRunner: IQueryRunner): T;
}
export async function prepareRepository<T>(
  repository: IRepositoryConstructor<T>,
  queryRunnerOrConnectionName?: IQueryRunner | string
): Promise<T> {
  // Check if using pooled query runner.
  if (!queryRunnerOrConnectionName || typeof queryRunnerOrConnectionName === "string") {
    const connectionName = queryRunnerOrConnectionName;
    return new repository(await getQueryRunner(connectionName));
  }

  const queryRunner = queryRunnerOrConnectionName;
  return new repository(queryRunner);
}
