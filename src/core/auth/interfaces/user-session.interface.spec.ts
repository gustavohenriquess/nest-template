import { UserSession } from './user-session.interface';

describe('UserSession', () => {
  it('should be able to instantiate a UserSession', () => {
    const session = new UserSession();
    session.sub = 'user-123';
    session.email = 'test@example.com';
    session.roles = ['ADMIN'];
    session.permissions = ['read'];

    expect(session).toBeDefined();
    expect(session.sub).toBe('user-123');
    expect(session.email).toBe('test@example.com');
    expect(session.roles).toEqual(['ADMIN']);
    expect(session.permissions).toEqual(['read']);
  });
});
