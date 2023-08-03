import { SapphireClient } from '@sapphire/framework';
import { ClientOptions } from 'discord.js';

export class LovelaceClient extends SapphireClient {
	public constructor(options: ClientOptions) {
		super(options);
	}

	destroy() {
		super.destroy();
	}

	login(token?: string): Promise<string> {
		return super.login(token);
	}
}