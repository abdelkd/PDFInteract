import { pgTable, text, integer, timestamp, boolean } from 'drizzle-orm/pg-core';
import { generateChatID } from '../chat';

export const user = pgTable('user', {
    id: text('id').primaryKey(),
    age: integer('age'),
    username: text('username').notNull().unique(),
    passwordHash: text('password_hash').notNull()
});

export const session = pgTable("session", {
    id: text('id').primaryKey(),
    userId: text('user_id').notNull().references(() => user.id),
    expiresAt: timestamp('expires_at', { withTimezone: true, mode: 'date' }).notNull()
});

export const chatTable = pgTable("chat", {
    id: text('id').primaryKey().notNull(),
    prompt: text('prompt').array().notNull(),
    answer: text('answer').array().notNull(),
    fileUri: text('file_Uri').notNull(),
    initializedAnswer: text('initialized_answer'),
})

export type Session = typeof session.$inferSelect;

export type User = typeof user.$inferSelect;
