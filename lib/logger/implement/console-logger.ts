import { ILogger } from "../logger";
import { ILoggerOptions } from "../logger-factory";
import { BaseLogger } from "./base-logger";

/**
 * Performs logging of the events.
 * This version of logger uses console to log events and use syntax highlighting.
 */
export class ConsoleLogger extends BaseLogger implements ILogger {
  /**
   * Logs query and parameters used in it.
   */
  public logQuery = (query: string, parameters?: any[]) => {
    const logLevel = this.options.level;

    if (logLevel === "all" || logLevel === true || (Array.isArray(logLevel) && !logLevel.includes("query"))) {
      const sql =
        query + (parameters && parameters.length ? " -- PARAMETERS: " + this.stringifyParams(parameters) : "");

      console.log("query:", sql);
    }
  };

  /**
   * Logs query that is failed.
   */
  public logQueryError = (error: string, query: string, parameters?: any[]) => {
    const logLevel = this.options.level;

    if (logLevel === "all" || logLevel === true || (Array.isArray(logLevel) && !logLevel.includes("error"))) {
      const sql =
        query + (parameters && parameters.length ? " -- PARAMETERS: " + this.stringifyParams(parameters) : "");

      console.error(`query failed:`, sql);
      console.error(`error:`, error);
    }
  };

  /**
   * Logs query that is slow.
   */
  public logQuerySlow = (time: number, query: string, parameters?: any[]) => {
    const sql = query + (parameters && parameters.length ? " -- PARAMETERS: " + this.stringifyParams(parameters) : "");

    console.warn(`query is slow:`, sql);
    console.warn(`execution time:`, time);
  };

  constructor(private options: ILoggerOptions) {
    super();
  }
}
