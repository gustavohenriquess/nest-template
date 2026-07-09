import { User, UserStatus } from './user.entity';

describe('User Entity', () => {
  it('should instantiate a user properly', () => {
    const partialUser = {
      id: '123',
      name: 'Test',
      email: 'test@example.com',
      status: UserStatus.ACTIVE,
    };

    const user = new User(partialUser);

    expect(user.id).toBe('123');
    expect(user.name).toBe('Test');
    expect(user.email).toBe('test@example.com');
    expect(user.status).toBe(UserStatus.ACTIVE);
  });

  it('isActive should return true when status is ACTIVE', () => {
    const user = new User({ status: UserStatus.ACTIVE });
    expect(user.isActive).toBe(true);
  });

  it('isActive should return false when status is INACTIVE', () => {
    const user = new User({ status: UserStatus.INACTIVE });
    expect(user.isActive).toBe(false);
  });

  it('isActive should return false when status is PENDING', () => {
    const user = new User({ status: UserStatus.PENDING });
    expect(user.isActive).toBe(false);
  });
});
