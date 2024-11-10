import { defineConfig } from 'drizzle-kit';
if (!process.env.DATABASE_URL && !process.env.POSTGRES_URL) throw new Error('DATABASE_URL or POSTGRES_URL must be set');

export default defineConfig({
  schema: './src/lib/server/db/schema.ts',
  dbCredentials: {
    url: process.env.POSTGRES_URL! ??  process.env.DATABASE_URL!
  },

  verbose: true,
  strict: true,
  dialect: 'postgresql'
});
