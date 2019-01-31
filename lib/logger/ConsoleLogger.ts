import { IQueryHook } from "../IQueryHook";
import { stringifyParams } from "./stringfy-params";

type LogLevel = "query" | "error" | "slow";

interface ILoggerOptions {
  level: boolean | "all" | LogLevel[];
}

/**
 * Performs logging of the events.
 * This version of logger uses console to log events and use syntax highlighting.
 */
export class ConsoleLogger implements IQueryHook {
  /**
   * Logs query and parameters used in it.
   */
  public onQuery(query: string, parameters?: any[]) {
    const logLevel = this.options.level;

    if (logLevel === "all" || logLevel === true || (Array.isArray(logLevel) && logLevel.includes("query"))) {
      const sql =
        query +
        (Array.isArray(parameters) && parameters.length > 0 ? " -- PARAMETERS: " + stringifyParams(parameters) : "");

      console.log("query:", sql);
    }
  }

  /**
   * Logs query that is failed.
   */
  public onError(error: string, query: string, parameters?: any[]) {
    const logLevel = this.options.level;

    if (logLevel === "all" || logLevel === true || (Array.isArray(logLevel) && logLevel.includes("error"))) {
      const sql =
        query +
        (Array.isArray(parameters) && parameters.length > 0 ? " -- PARAMETERS: " + stringifyParams(parameters) : "");

      console.error(`query failed:`, sql);
      console.error(`error:`, error);
    }
  }

  /**
   * Logs query that is slow.
   */
  public onSlow(executionTime: number, query: string, parameters?: any[]) {
    const logLevel = this.options.level;

    if (logLevel === "all" || logLevel === true || (Array.isArray(logLevel) && logLevel.includes("slow"))) {
      const sql =
        query +
        (Array.isArray(parameters) && parameters.length > 0 ? " -- PARAMETERS: " + stringifyParams(parameters) : "");

      console.warn(`query is slow:`, sql);
      console.warn(`execution time:`, executionTime);
    }
  }

  constructor(
    private readonly options: ILoggerOptions = {
      level: true,
    }
  ) {}
}
