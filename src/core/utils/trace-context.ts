import { AsyncLocalStorage } from 'node:async_hooks';

/**
 * Utility to manage a global trace/correlation context across async calls.
 * This is useful for making the current correlation ID available to the Logger
 * without passing it through layers or using the @Inject(REQUEST) pattern.
 */
export class TraceContext {
  private static storage = new AsyncLocalStorage<string>();

  /**
   * Runs a function within a trace context.
   * @param id The correlation ID to set.
   * @param next The function to execute.
   */
  static run<T>(id: string, next: () => T): T {
    return this.storage.run(id, next);
  }

  /**
   * Retrieves the current correlation ID from the context.
   */
  static getCorrelationId(): string | undefined {
    return this.storage.getStore();
  }
}
