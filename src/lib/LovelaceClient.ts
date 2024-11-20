import { SapphireClient } from '@sapphire/framework';
import { ClientOptions } from 'discord.js';

/**
 * The base client for Lovelace that extends SapphireClient.
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
	 * Logs client in and establishes new websocket connection with Discord.
	 * Overrides the login function from SapphireClient.
	 * @param {string} [token] - the bot token.
	 * @returns {Promise<string>} - the token used to log in with.
	 */
	public override login(token?: string): Promise<string> {
		return super.login(token);
	}

	/**
	 * Logs out and terminates the connection to Discord and destroys the client.
	 * Overides SapphireClient's destroy function.
	 */
	public override destroy(): Promise<void> {
		return super.destroy();
	}
}
