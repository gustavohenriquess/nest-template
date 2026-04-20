// Ensure we use localhost for local E2E tests, as 'postgres' is only for inside Docker.
process.env.DATABASE_URL =
  'postgresql://bn_user:bn_password@localhost:5432/nest_db';
process.env.DATABASE_URL_PRIMARY =
  'postgresql://bn_user:bn_password@localhost:5432/primary_db';
process.env.DATABASE_URL_SECONDARY =
  'postgresql://bn_user:bn_password@localhost:5432/secondary_db';
process.env.OTEL_EXPORTER_OTLP_ENDPOINT = 'http://localhost:4318';
