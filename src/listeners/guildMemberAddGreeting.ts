import { Listener } from '@sapphire/framework';
import { GuildMember, TextChannel } from 'discord.js';

export class GuildMemberAddGreeting extends Listener {
	public constructor(context: Listener.Context, options: Listener.Options) {
		super(context, {
			...options,
			event: 'guildMemberAdd',
			once: false,
		});
	}

	public override async run(member: GuildMember) {
		// Sending message to designated system channel using systemChannel property of Guild
		await member.guild.systemChannel?.send(
			`Hi ${member.user}. Welcome to the ACM Discord Server!`
		);
	}
}
