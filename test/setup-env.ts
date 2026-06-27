// Use existing environment variables if present (e.g., in CI), otherwise fallback to local defaults.
process.env.DATABASE_URL =
  process.env.DATABASE_URL ||
  'postgresql://postgres:postgres@localhost:5432/nest_db';

process.env.DATABASE_URL_PRIMARY =
  process.env.DATABASE_URL_PRIMARY ||
  'postgresql://postgres:postgres@localhost:5432/primary_db';

process.env.DATABASE_URL_SECONDARY =
  process.env.DATABASE_URL_SECONDARY ||
  'postgresql://postgres:postgres@localhost:5432/secondary_db';

process.env.OTEL_EXPORTER_OTLP_ENDPOINT =
  process.env.OTEL_EXPORTER_OTLP_ENDPOINT || 'http://localhost:4318';
