import { LoginSchema } from './login.dto';

describe('LoginDto Schema', () => {
  it('should validate a correct payload', () => {
    const payload = {
      email: 'test@example.com',
      password: 'password123',
    };

    const result = LoginSchema.safeParse(payload);
    expect(result.success).toBe(true);
  });

  it('should fail if email is invalid', () => {
    const payload = {
      email: 'invalid-email',
      password: 'password123',
    };

    const result = LoginSchema.safeParse(payload);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('E-mail inválido');
    }
  });

  it('should fail if password is empty', () => {
    const payload = {
      email: 'test@example.com',
      password: '',
    };

    const result = LoginSchema.safeParse(payload);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('A senha é obrigatória');
    }
  });

  it('should fail if fields are missing', () => {
    const payload = {};

    const result = LoginSchema.safeParse(payload);
    expect(result.success).toBe(false);
    if (!result.success) {
      const messages = result.error.issues.map((i) => i.message);
      // Zod standard required error is "Required" or similar, we just verify it failed
      expect(messages.length).toBeGreaterThan(0);
    }
  });
});
