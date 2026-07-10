import { User, UserStatus } from './user.entity';

describe('User Entity', () => {
  it('should create a user instance', () => {
    const user = new User({
      id: '1',
      name: 'Test',
      email: 'test@test.com',
      status: UserStatus.ACTIVE,
    });

    expect(user.id).toBe('1');
    expect(user.name).toBe('Test');
    expect(user.email).toBe('test@test.com');
    expect(user.status).toBe(UserStatus.ACTIVE);
  });

  it('isActive should return true if status is ACTIVE and deletedAt is null', () => {
    const user = new User({
      status: UserStatus.ACTIVE,
      deletedAt: null,
    });
    expect(user.isActive).toBe(true);
  });

  it('isActive should return false if status is not ACTIVE', () => {
    const user = new User({
      status: UserStatus.INACTIVE,
      deletedAt: null,
    });
    expect(user.isActive).toBe(false);
  });

  it('isActive should return false if deletedAt is present', () => {
    const user = new User({
      status: UserStatus.ACTIVE,
      deletedAt: new Date(),
    });
    expect(user.isActive).toBe(false);
  });
});
