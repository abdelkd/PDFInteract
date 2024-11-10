import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { env } from '$env/dynamic/private';
import { drizzle as vercelDrizzle } from 'drizzle-orm/vercel-postgres';
import { sql } from '@vercel/postgres';

if (!process.env.DATABASE_URL && !process.env.POSTGRES_URL) throw new Error('DATABASE_URL or POSTGRES_URL must be set');

const client = postgres(env.DATABASE_URL);
export const db = process.env.POSTGRES_URL ? vercelDrizzle(sql) : drizzle(client);
