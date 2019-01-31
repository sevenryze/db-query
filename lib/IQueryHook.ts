/**
 * Performs actions on the events.
 */
export interface IQueryHook {
  /**
   * Hook on query and parameters used in it.
   */
  onQuery(query: string, parameters?: any[]): any;

  /**
   * Hook on query that is failed.
   */
  onError(error: string, query: string, parameters?: any[]): any;

  /**
   * Hook on query that is slow.
   */
  onSlow(time: number, query: string, parameters?: any[]): any;
}
