import { User, UserStatus } from './user.entity';

describe('User Entity', () => {
  it('should instantiate a user properly', () => {
    const partialUser = {
      id: '123',
      name: 'Test',
      email: 'test@example.com',
      status: UserStatus.ATIVO,
    };

    const user = new User(partialUser);

    expect(user.id).toBe('123');
    expect(user.name).toBe('Test');
    expect(user.email).toBe('test@example.com');
    expect(user.status).toBe(UserStatus.ATIVO);
  });

  it('isActive should return true when status is ATIVO', () => {
    const user = new User({ status: UserStatus.ATIVO });
    expect(user.isActive).toBe(true);
  });

  it('isActive should return false when status is INATIVO', () => {
    const user = new User({ status: UserStatus.INATIVO });
    expect(user.isActive).toBe(false);
  });

  it('isActive should return false when status is PENDENTE', () => {
    const user = new User({ status: UserStatus.PENDENTE });
    expect(user.isActive).toBe(false);
  });
});
