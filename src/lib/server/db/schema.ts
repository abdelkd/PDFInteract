import { pgTable, text, integer, timestamp, json } from 'drizzle-orm/pg-core';
import type { Thread } from '$lib/types';

export const user = pgTable('user', {
	id: text('id').primaryKey(),
	age: integer('age'),
	username: text('username').notNull().unique(),
	passwordHash: text('password_hash').notNull()
});

export const session = pgTable('session', {
	id: text('id').primaryKey(),
	userId: text('user_id')
		.notNull()
		.references(() => user.id),
	expiresAt: timestamp('expires_at', { withTimezone: true, mode: 'date' }).notNull()
});

export const chatTable = pgTable('chat', {
	id: text('id').primaryKey().notNull(),
	chat: json('chat').$type<Thread[]>().notNull().default([]),
	fileUri: text('file_Uri').notNull(),
	createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
    expiresOn: timestamp('expires_on', { withTimezone: true, mode: 'date' }).notNull(),
});

export type Session = typeof session.$inferSelect;

export type User = typeof user.$inferSelect;
