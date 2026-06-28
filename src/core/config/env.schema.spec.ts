import { validate } from './env.schema';

describe('envSchema', () => {
  const validConfig = {
    PORT: '3000',
    GCP_PRIMARY_PROJECT_ID: 'test-project',
    POSTGRES_USER: 'test-user',
    POSTGRES_PASSWORD: 'test-password',
    POSTGRES_DB: 'test-db',
    DATABASE_URL: 'postgresql://localhost:5432/test-db',
    JWT_SECRET: 'test-secret-key-that-is-long-enough',
  };

  it('should validate a correct config', () => {
    const result = validate(validConfig);
    expect(result).toMatchObject({
      PORT: 3000,
      GCP_PRIMARY_PROJECT_ID: 'test-project',
    });
  });

  it('should use default values', () => {
    const configWithoutPort = { ...validConfig } as Record<string, unknown>;
    delete configWithoutPort.PORT;

    const result = validate(configWithoutPort);
    expect(result.PORT).toBe(3000);
    expect(result.OTEL_SERVICE_NAME).toBe('nest-template');
  });

  it('should throw error on missing required fields', () => {
    const invalidConfig = { ...validConfig } as Record<string, unknown>;
    delete invalidConfig.GCP_PRIMARY_PROJECT_ID;

    expect(() => validate(invalidConfig)).toThrow('Config validation error');
  });

  it('should throw error on invalid URLs', () => {
    const invalidConfig = {
      ...validConfig,
      DATABASE_URL: 'not-a-url',
    };

    expect(() => validate(invalidConfig)).toThrow('Config validation error');
  });

  it('should coerce string port to number', () => {
    const result = validate({
      ...validConfig,
      PORT: '5000',
    });
    expect(result.PORT).toBe(5000);
  });

  it('should parse boolean preprocess fields from strings and booleans', () => {
    // Test case 1: all as strings
    const configWithStrings = {
      ...validConfig,
      PUBSUB_ENABLED: 'true',
      BIGQUERY_ENABLED: 'false',
      STORAGE_ENABLED: 'true',
      CACHE_ENABLED: 'false',
    };
    const result1 = validate(configWithStrings);
    expect(result1.PUBSUB_ENABLED).toBe(true);
    expect(result1.BIGQUERY_ENABLED).toBe(false);
    expect(result1.STORAGE_ENABLED).toBe(true);
    expect(result1.CACHE_ENABLED).toBe(false);

    // Test case 2: all as real booleans
    const configWithBooleans = {
      ...validConfig,
      PUBSUB_ENABLED: true,
      BIGQUERY_ENABLED: false,
      STORAGE_ENABLED: true,
      CACHE_ENABLED: false,
    };
    const result2 = validate(configWithBooleans);
    expect(result2.PUBSUB_ENABLED).toBe(true);
    expect(result2.BIGQUERY_ENABLED).toBe(false);
    expect(result2.STORAGE_ENABLED).toBe(true);
    expect(result2.CACHE_ENABLED).toBe(false);
  });
});
