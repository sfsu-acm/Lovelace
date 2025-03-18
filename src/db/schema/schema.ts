import { mysqlTable, int, varchar } from 'drizzle-orm/mysql-core';

export const users = mysqlTable('users', {
  id: int('id').autoincrement().primaryKey(),
  discordId: varchar('discord_id', { length: 256 }).notNull().unique(),
})
