export interface IQueryRunner {
  query(sqlString: string, values?: any[]): Promise<any>;
}

export interface ITransactionQueryRunner extends IQueryRunner {
  startTransaction(isolationLevel?: string): Promise<void>;

  commitTransaction(): Promise<void>;

  rollbackTransaction(): Promise<void>;
}
