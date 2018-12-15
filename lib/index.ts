import { Connection, IConnectionOptions } from "./connection/connection";
import { defaultConnectionManager } from "./connection/connection-manager";

export function getConnectionManager() {
  return defaultConnectionManager;
}

export function getConnection(connectionName: string = "default") {
  return defaultConnectionManager.get(connectionName);
}

export function getQueryRunner(connectionName: string = "default") {
  return defaultConnectionManager.get(connectionName).getQueryRunner();
}

export function getTransactionQueryRunner(connectionName: string = "default") {
  return defaultConnectionManager.get(connectionName).getTransactionQueryRunner();
}

export async function createConnection(options: IConnectionOptions): Promise<Connection> {
  const connection = defaultConnectionManager.create(options);

  await connection.open();

  return connection;
}
