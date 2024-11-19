import './lib/setup';
import { LogLevel } from '@sapphire/framework';
import { ClientOptions, GatewayIntentBits, Partials } from 'discord.js';
import { LovelaceClient } from "./lib/LovelaceClient";

const options: ClientOptions = {
	defaultPrefix: '!',
	caseInsensitiveCommands: true,
	logger: {
		level: LogLevel.Debug,
	},
	shards: 'auto',
	intents: [
		GatewayIntentBits.GuildEmojisAndStickers,
		GatewayIntentBits.GuildMembers,
		GatewayIntentBits.GuildMessageReactions,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildVoiceStates,
		GatewayIntentBits.MessageContent,
	],
	partials: [Partials.Channel],
	loadMessageCommandListeners: true,
}

const client = new LovelaceClient(options);

const main = async () => {
	try {
		client.logger.info('Logging in');
		await client.login();
		client.logger.info('logged in');
	} catch (error) {
		client.logger.fatal(error);
		client.destroy();
		process.exit(1);
	}
};

main();
