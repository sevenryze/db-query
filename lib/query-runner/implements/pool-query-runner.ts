import { Connection } from "../../connection/connection";
import { IQueryRunner } from "../query-runner";
import { BaseQueryRunner } from "./base-query-runner";

export class PoolQueryRunner extends BaseQueryRunner implements IQueryRunner {
  constructor(queryIssuer: any, connection: Connection) {
    super(queryIssuer, connection);
  }
}
