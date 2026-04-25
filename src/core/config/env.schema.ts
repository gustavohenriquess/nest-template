import { z } from 'zod';

export const envSchema = z.object({
  PORT: z.coerce.number().default(3000),

  // CORS Configuration
  ALLOWED_ORIGINS: z.string().default('*'),

  // Auth / Security
  JWT_SECRET: z
    .string()
    .min(10, 'JWT secret must be at least 10 characters long'),
  AUTH_ROLES_CLAIM_PATH: z.string().default('roles'),
  AUTH_PERMISSIONS_CLAIM_PATH: z.string().default('permissions'),

  // OTEL & Monitoring (Throttler)
  THROTTLE_TTL: z.coerce.number().default(60000), // ms
  THROTTLE_LIMIT: z.coerce.number().default(100),

  // GCP Configuration
  GCP_PRIMARY_PROJECT_ID: z.string(),
  GCP_PROJECT_A_ID: z.string().optional(),
  GCP_PROJECT_B_ID: z.string().optional(),

  // Database Configuration
  POSTGRES_USER: z.string(),
  POSTGRES_PASSWORD: z.string(),
  POSTGRES_DB: z.string(),

  // Prisma Connection
  DATABASE_URL: z.string().url(),
  SHADOW_DATABASE_URL: z.string().url().optional(),
  DATABASE_URL_PRIMARY: z.string().url().optional(),
  DATABASE_URL_SECONDARY: z.string().url().optional(),

  // OpenTelemetry Configuration
  OTEL_SERVICE_NAME: z.string().default('nest-template'),
  OTEL_EXPORTER_OTLP_ENDPOINT: z.string().url().optional(),

  // Collector External Exporters
  JAEGER_URL: z.string().optional(),
  DD_URL: z.string().optional(),
  DD_KEY: z.string().optional(),
});

export type Env = z.infer<typeof envSchema>;

export function validate(config: Record<string, unknown>) {
  const result = envSchema.safeParse(config);

  if (!result.success) {
    console.error('❌ Invalid environment variables:', result.error.format());
    throw new Error('Config validation error');
  }

  return result.data;
}
