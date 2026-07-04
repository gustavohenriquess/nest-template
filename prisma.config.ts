import * as dotenv from 'dotenv';
dotenv.config();

export default {
  datasource: {
    url: process.env.DATABASE_URL,
    shadowDatabaseUrl: process.env.SHADOW_DATABASE_URL,
  },
  migrations: {
    seed: 'ts-node prisma/seed.ts',
  },
  schema: 'prisma/schema',
};
