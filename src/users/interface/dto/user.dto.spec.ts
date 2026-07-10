import { CreateUserSchema, UpdateUserSchema } from './user.dto';

describe('UserDTO Schemas', () => {
  it('should fail CreateUserSchema if name is too short', () => {
    const result = CreateUserSchema.safeParse({
      name: 'A',
      email: 'test@test.com',
      password: 'password123',
    });
    expect(result.success).toBe(false);
  });

  it('should validate CreateUserSchema with defaults', () => {
    const result = CreateUserSchema.safeParse({
      name: 'John Doe',
      email: 'test@test.com',
      password: 'password123',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.status).toBe('PENDING');
    }
  });

  it('should validate UpdateUserSchema with empty object', () => {
    const result = UpdateUserSchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.status).toBeUndefined();
    }
  });

  it('should validate UpdateUserSchema with status', () => {
    const result = UpdateUserSchema.safeParse({ status: 'ACTIVE' });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.status).toBe('ACTIVE');
    }
  });
});
