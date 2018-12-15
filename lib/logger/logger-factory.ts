import { ConsoleLogger } from "./implement/console-logger";
import { ILogger } from "./logger";

type LogLevel = "query" | "error" | "warn" | "info";

/**
 * Logger options.
 */
export interface ILoggerOptions {
  type?: "advanced-console" | "simple-console" | "file" | "debug";
  level: boolean | "all" | LogLevel[];
}

export function loggerFactory(
  options: ILoggerOptions = {
    level: ["warn", "error"],
  }
): ILogger {
  switch (options.type) {
    case "simple-console":
      throw new Error(`Not implement!`);

    case "file":
      throw new Error(`Not implement!`);

    case "advanced-console":
      throw new Error(`Not implement!`);

    case "debug":
      throw new Error(`Not implement!`);
    default:
      return new ConsoleLogger(options);
  }
}
