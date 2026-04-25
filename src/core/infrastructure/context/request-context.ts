import { AsyncLocalStorage } from 'async_hooks';
import { UserSession } from '../../auth/interfaces/user-session.interface';

export interface RequestContextStore {
  user?: UserSession;
  requestId?: string;
}

export class RequestContext {
  private static readonly storage =
    new AsyncLocalStorage<RequestContextStore>();

  static get current(): RequestContextStore | undefined {
    return this.storage.getStore();
  }

  static get user(): UserSession | undefined {
    return this.current?.user;
  }

  static set user(user: UserSession) {
    const store = this.current;
    if (store) {
      store.user = user;
    }
  }

  static run<T>(store: RequestContextStore, callback: () => T): T {
    return this.storage.run(store, callback);
  }
}
