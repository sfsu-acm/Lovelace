import './lib/setup';
import { LogLevel, SapphireClient } from '@sapphire/framework';
//added textchannel and guildmember
import { TextChannel,GuildMember, GatewayIntentBits, Partials } from 'discord.js';

const client = new SapphireClient({
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
});

const main = async () => {
	try {
		client.logger.info('Logging in');
		await client.login();
		client.logger.info('logged in');
		//added an event that sends a welcome message
        client.on('guildMemberAdd',member =>{
			const guildic= member.guild;
			const channel = guildic.channels.cache.get('channelID');
			if (channel instanceof TextChannel) {
			channel.send("Welcome to the server! Have a nice stay!");
			}
		});
	} catch (error) {
		client.logger.fatal(error);
		client.destroy();
		process.exit(1);
	}
};

main();
