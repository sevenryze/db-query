import { Connection, IConnectionOptions } from "./connection/Connection";
import { ConnectionManager } from "./connection/ConnectionManager";

export { ConsoleLogger } from "./logger/ConsoleLogger";
export { Connection } from "./connection/Connection";
export { ConnectionManager } from "./connection/ConnectionManager";

const defaultConnectionManager = new ConnectionManager();

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
