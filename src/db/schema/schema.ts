import { mysqlTable, int, varchar } from 'drizzle-orm/mysql-core';

export const users = mysqlTable('users', {
	id: int('id').autoincrement().primaryKey(),
	// varchar(32) is future proof enough for discord snowflakes
	discordId: varchar('discord_id', { length: 32 }).notNull().unique(),
});

export const scheduledEvents = mysqlTable('scheduled_events', {
	id: int('id').autoincrement().primaryKey(),
	eventId: varchar('event_id', { length: 32 }).notNull().unique(),
	roleId: varchar('role_id', { length: 32 }).notNull().unique(),
});
