import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import * as dotenv from 'dotenv';

dotenv.config();

/**
 * Prisma Seed Script
 * -------------------
 * This script is used to populate your database with initial data.
 * It is executed when running `npx prisma db seed`.
 *
 * For a clean template, this script is provided as a boilerplate.
 * To use it:
 * 1. Define your models in `schema.prisma`.
 * 2. Run `npx prisma migrate dev` to update your database.
 * 3. Uncomment and modify the logic below to seed your data.
 */

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error('DATABASE_URL environment variable is not set');
}

const pool = new Pool({ connectionString: databaseUrl });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Starting database seeding...');

  // Satisfy require-await lint rule since the example below is commented out
  await Promise.resolve();

  /**
   * Example: Seeding an Admin User
   *
   * const adminUser = await prisma.user.upsert({
   *   where: { email: 'admin@example.com' },
   *   update: {},
   *   create: {
   *     email: 'admin@example.com',
   *     name: 'Administrator',
   *     roles: ['ADMIN'],
   *   },
   * });
   * console.log({ adminUser });
   */

  console.log('✅ Seeding completed successfully.');
}

main()
  .then(async () => {
    await prisma.$disconnect();
    await pool.end();
  })
  .catch(async (e) => {
    console.error('❌ Error during seeding:', e);
    await prisma.$disconnect();
    await pool.end();
    process.exit(1);
  });
