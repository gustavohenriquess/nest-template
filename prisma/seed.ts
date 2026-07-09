import { PrismaClient, UserStatus } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import * as dotenv from 'dotenv';
import * as argon2 from 'argon2';

dotenv.config();

/**
 * Prisma Seed Script
 * -------------------
 * This script is used to populate your database with initial data.
 * It is executed when running `npx prisma db seed`.
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

  // 1. Create Permission
  const basicViewPermission = await prisma.permission.upsert({
    where: { name: 'basic:view' },
    update: {},
    create: {
      name: 'basic:view',
      description: 'Basic view permission',
    },
  });
  console.log(`✅ Permission seeded: ${basicViewPermission.name}`);

  // 2. Create Roles
  const basicRole = await prisma.role.upsert({
    where: { name: 'BASIC' },
    update: {},
    create: {
      name: 'BASIC',
      description: 'Basic User Role',
      permissions: {
        connect: [{ id: basicViewPermission.id }],
      },
    },
  });
  console.log(`✅ Role seeded: ${basicRole.name}`);

  const adminRole = await prisma.role.upsert({
    where: { name: 'ADMIN' },
    update: {},
    create: {
      name: 'ADMIN',
      description: 'Administrator Role',
    },
  });
  console.log(`✅ Role seeded: ${adminRole.name}`);

  // 3. Create Admin User
  const adminPassword = await argon2.hash('admin123'); // Default password
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@admin.com' },
    update: {},
    create: {
      email: 'admin@admin.com',
      name: 'Administrator',
      password: adminPassword,
      status: UserStatus.ACTIVE,
      roles: {
        connect: [{ id: adminRole.id }],
      },
    },
  });
  console.log(`✅ User seeded: ${adminUser.email}`);

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
