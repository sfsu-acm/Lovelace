import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import { scheduledEvents, users } from '../db/schema/schema';

/**
 * Singleton database connector that should only be inigialized inside LovelaceClient.
 */
export class LovelaceDB {
	private static instance: LovelaceDB | null = null;
	private static mysqlConnection: mysql.Connection | null = null;
	private db: ReturnType<typeof drizzle>;

	private constructor(connection: mysql.Connection) {
		this.db = drizzle(connection);
	}

	public static async getInstance(): Promise<LovelaceDB> {
		if (!LovelaceDB.instance) {
			LovelaceDB.mysqlConnection = await mysql.createConnection({
				uri: process.env.DATABASE_URL,
			});

			LovelaceDB.instance = new LovelaceDB(LovelaceDB.mysqlConnection);
		}
		return LovelaceDB.instance;
	}

	public static async destroy() {
		if (LovelaceDB.mysqlConnection) {
			await LovelaceDB.mysqlConnection.end();
			LovelaceDB.instance = null;
		}
	}

	public async createUser(discordId: string) {
		return await this.db.insert(users).values({ discordId });
	}

	/**
	 * createScheduledEvent
	 */
	public async createScheduledEvent(eventId: string, roleId: string) {
		return await this.db.insert(scheduledEvents).values({
			eventId,
			roleId,
		});
	}
}
