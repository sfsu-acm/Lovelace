import { SapphireClient } from '@sapphire/framework';
import { ClientOptions } from 'discord.js';

/**
 * Represents a custom LovelaceClient class, extending SapphireClient.
 */
export class LovelaceClient extends SapphireClient {
	
	/**
	 * Constructor to initialize a new instance of LovelaceClient
	 * @param {ClientOptions} options - the defined options for the discord client. Parameter required by SapphireClient
	 */
	constructor(options: ClientOptions) {
		super(options);
	}

	/**
	 * Logs the user into Discord with the provided token.
	 * Overrides the login function from SapphireClient
	 * @param token - the bot token found in the `.env` file.
	 * @returns {Promise<string>} - an asynchronous function which returns the bot token string when login successfully finishes.
	 */
	public override login(token?: string): Promise<string> {
		return super.login(token);
	}

	/**
	 * Logs out and terminates the connection to Discord and destroys the client. :(
	 * @returns {Promise<void>} - an asynchronous function which resolves when the client has been destroyed.
	 */
	public override destroy(): Promise<void> {
		return super.destroy();
	}
}
