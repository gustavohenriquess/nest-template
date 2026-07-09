import { z } from 'zod';
import { UseZodSchema } from '@/core/decorators/zod.decorator';

export const LoginSchema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(1, 'A senha é obrigatória'),
});

@UseZodSchema(LoginSchema)
export class LoginDto {
  email!: string;
  password!: string;
}
