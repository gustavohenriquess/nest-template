import { Logger, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { IPrismaService } from './prisma-service.interface';

export class PrismaService
  extends PrismaClient
  implements IPrismaService, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);
  private readonly pool: Pool;

  constructor(databaseUrl: string) {
    const pool = new Pool({ connectionString: databaseUrl });
    const adapter = new PrismaPg(pool);

    super({ adapter });

    this.pool = pool;
    this.logger.log(
      `PrismaService initialized for database URL: ${this.maskUrl(databaseUrl)}`,
    );
  }

  async connect() {
    try {
      await this.$connect();
      this.logger.log('Prisma connected to database');
    } catch (error) {
      this.logger.error('Error connecting to database:', error);
      throw error;
    }
  }

  async disconnect() {
    try {
      await this.$disconnect();
      await this.pool.end();
      this.logger.log('Prisma disconnected from database');
    } catch (error) {
      this.logger.error('Error disconnecting from database:', error);
    }
  }

  async onModuleDestroy() {
    await this.disconnect();
  }

  private maskUrl(url: string): string {
    try {
      const parsed = new URL(url);
      parsed.password = '****';
      return parsed.toString();
    } catch {
      return '****';
    }
  }
}
