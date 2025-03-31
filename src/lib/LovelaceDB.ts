/**
 * @file LovelaceDB.ts
 * @description Singleton database connector for MySQL integration using Drizzle ORM.
 * This class provides a centralized interface for database operations.
 */

import { drizzle } from 'drizzle-orm/mysql2';
import { eq } from 'drizzle-orm';
import mysql from 'mysql2/promise';
import * as schema from '../db/schema/schema';

/**
 * Singleton database connector that should only be initialized inside LovelaceClient.
 * Provides methods for common database operations and maintains a single database connection.
 * @class
 */
export class LovelaceDB {
	/**
	 * Stores the singleton instance of LovelaceDB.
	 */
	private static instance: LovelaceDB | null = null;
	/**
	 * Stores the MySQL connection.
	 */
	private static mysqlConnection: mysql.Connection | null = null;

	/**
	 * The Drizzle ORM database instance.
	 */
	private db: ReturnType<typeof drizzle>;

	/**
	 * Private constructor to prevent direct instantiation.
	 * Initializes the Drizzle ORM with the provided MySQL connection.
	 * @private
	 * @constructor
	 * @param connection - An active MySQL connection
	 */
	private constructor(connection: mysql.Connection) {
		this.db = drizzle({ client: connection, schema, mode: 'default' });
	}

	/**
	 * Gets the singleton instance of LovelaceDB.
	 * Creates a new instance if one doesn't exist.
	 * @static
	 * @async
	 * @returns The singleton instance of LovelaceDB
	 */
	public static async getInstance(): Promise<LovelaceDB> {
		if (!LovelaceDB.instance) {
			LovelaceDB.mysqlConnection = await mysql.createConnection({
				uri: process.env.DATABASE_URL,
			});
			LovelaceDB.instance = new LovelaceDB(LovelaceDB.mysqlConnection);
		}
		return LovelaceDB.instance;
	}

	/**
	 * Closes the MySQL connection and resets the instance.
	 * @static
	 * @async
	 */
	public static async destroy() {
		if (LovelaceDB.mysqlConnection) {
			await LovelaceDB.mysqlConnection.end();
			LovelaceDB.instance = null;
		}
	}

	/**
	 * Creates a new user in the database.
	 * @async
	 * @param discordId - The Discord ID of the user
	 * @returns The result of the insert operation
	 */
	public async createUser(discordId: string) {
		return await this.db.insert(schema.users).values({ discordId });
	}

	/**
	 * Creates a new scheduled event in the database.
	 * @async
	 * @param eventId - The ID of the event
	 * @param roleId - The role ID associated with the event
	 * @returns The first result of the insert operation or null
	 */
	public async createScheduledEvent(eventId: string, roleId: string) {
		const result = await this.db.insert(schema.scheduledEvents).values({
			eventId,
			roleId,
		});
		return result[0] || null;
	}

	/**
	 * Finds a scheduled event by its ID.
	 * @async
	 * @param eventId - The ID of the event to find
	 * @returns The first matching event or null if not found
	 */
	public async findScheduledEvent(eventId: string) {
		const results = await this.db
			.select()
			.from(schema.scheduledEvents)
			.where(eq(schema.scheduledEvents.eventId, eventId));
		return results[0] || null;
	}

	/**
	 * Deletes a scheduled event by its ID.
	 * @async
	 * @param eventId - The ID of the event to delete
	 * @returns The result of the delete operation or null
	 */
	public async deleteScheduledEvent(eventId: string) {
		const result = await this.db
			.delete(schema.scheduledEvents)
			.where(eq(schema.scheduledEvents.eventId, eventId));
		return result[0] || null;
	}
}
