import { ApplyOptions } from '@sapphire/decorators';
import { DurationFormatter } from '@sapphire/time-utilities';
import { Command, version as sapphireVersion } from '@sapphire/framework';
import { EmbedBuilder, codeBlock, version as discordVersion } from 'discord.js';

@ApplyOptions<Command.Options>({
	description: 'Gets info and stats for the Discord bot.',
})
export class StatsCommand extends Command {
	public override registerApplicationCommands(registry: Command.Registry) {
		registry.registerChatInputCommand({
			name: this.name,
			description: this.description,
		});
	}

	private buildStatsEmbed(): EmbedBuilder {
		return new EmbedBuilder()
			.setAuthor({ name: `${this.container.client.user?.tag}` })
			.setColor(0x04ff70)
			.setThumbnail(`${this.container.client.user?.avatarURL()}`)
			.addFields(
				{
					name: '🍽️ Serving',
					value: codeBlock(
						`${this.container.client.guilds.cache.size} server(s)\n${this.container.client.users.cache.size} user(s)`,
					),
					inline: true,
				},
				{
					name: '🕑 Uptime',
					value: codeBlock(
						`${this.container.client.uptime ? new DurationFormatter().format(this.container.client.uptime) : 'N/A'}`,
					),
					inline: true,
				},
				{
					name: 'Author',
					value: '[Leavism](https://leavism.dev/)',
					inline: false,
				},
			)
			.setFooter({
				text: `Built using: Sapphire ${sapphireVersion} | Discord.js ${discordVersion} | Node.js ${process.version}`,
			});
	}

	public override async chatInputRun(
		interaction: Command.ChatInputCommandInteraction,
	) {
		return await interaction.reply({ embeds: [this.buildStatsEmbed()] });
	}
}
