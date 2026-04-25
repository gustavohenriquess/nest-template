import { RequestContext } from './request-context';
import { UserSession } from '../../auth/interfaces/user-session.interface';

describe('RequestContext', () => {
  it('should store and retrieve user session', () => {
    const user: UserSession = {
      sub: 'user-1',
      email: 'user1@example.com',
      roles: ['USER'],
      permissions: [],
    };

    RequestContext.run({}, () => {
      RequestContext.user = user;
      expect(RequestContext.user).toEqual(user);
      expect(RequestContext.current?.user).toEqual(user);
    });
  });

  it('should handle undefined store', () => {
    // Attempting to set user outside of run() should not throw but won't store anything
    const user: UserSession = {
      sub: 'user-1',
      email: 'user1@example.com',
      roles: ['USER'],
      permissions: [],
    };

    RequestContext.user = user;
    expect(RequestContext.user).toBeUndefined();
  });

  it('should maintain isolation between parallel executions', async () => {
    const runTask = (id: string) => {
      const user = { sub: id } as UserSession;
      return RequestContext.run({}, async () => {
        RequestContext.user = user;
        // Simulate async work
        await new Promise((resolve) => setTimeout(resolve, 10));
        expect(RequestContext.user?.sub).toBe(id);
      });
    };

    await Promise.all([
      runTask('user-A'),
      runTask('user-B'),
      runTask('user-C'),
    ]);
  });
});
