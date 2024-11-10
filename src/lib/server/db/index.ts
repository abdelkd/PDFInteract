import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { env } from '$env/dynamic/private';
import { drizzle as vercelDrizzle } from 'drizzle-orm/vercel-postgres';
import { sql } from '@vercel/postgres';

if (!env.DATABASE_URL) throw new Error('DATABASE_URL is not set');
// throw an error if app is running on vercel but POSTGRES_URL is not set
if (process.env.VERCEL_URL && !process.env.POSTGRES_URL) throw new Error('POSTGRES_URL is not set');
const client = postgres(env.DATABASE_URL);

export const db = process.env.VERCEL_URL ? vercelDrizzle(sql) : drizzle(client);
