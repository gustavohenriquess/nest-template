import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';

/**
 * Helper to manage database state during E2E tests.
 */
export class DbHelper {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  /**
   * Run migrations to ensure the test database schema is up-to-date.
   */
  syncSchema() {
    try {
      console.log('Syncing test database schema...');
      execSync('npx prisma migrate deploy', { stdio: 'inherit' });
    } catch (error) {
      console.error('Failed to sync test database schema:', error);
      throw error;
    }
  }

  /**
   * Truncate all tables in the public schema to ensure test isolation.
   */
  async truncateAll() {
    const tablenames = await this.prisma.$queryRaw<
      Array<{ tablename: string }>
    >`
      SELECT tablename FROM pg_tables WHERE schemaname='public' AND tablename != '_prisma_migrations'
    `;

    const tables = tablenames
      .map(({ tablename }) => `"public"."${tablename}"`)
      .join(', ');

    if (tables) {
      try {
        await this.prisma.$executeRawUnsafe(
          `TRUNCATE TABLE ${tables} CASCADE;`,
        );
      } catch (error) {
        console.error('Error truncating tables:', error);
      }
    }
  }

  async close() {
    await this.prisma.$disconnect();
  }
}
