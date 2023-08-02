import { Listener } from '@sapphire/framework';
import { GuildMember, TextChannel } from 'discord.js';

export class GuildMemberRemovalMessage extends Listener {
	public constructor(context: Listener.Context, options: Listener.Options) {
		super(context, {
			...options,
			event: 'guildMemberRemove',
			once: false,
		});
	}

	public async run(member: GuildMember) {
		await (
			member.guild.channels.cache.find(
				(channel) => channel.name === 'logging'
			) as TextChannel
		).send(`${member.user} has left the server`);
	}
}
