import { EmbedBuilder } from '@discordjs/builders';
import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '@sapphire/framework';
import { Interaction, Message, codeBlock } from 'discord.js';
import { getLoadingMessage } from '../../lib/utils';

@ApplyOptions<Command.Options>({
	description: 'Get the bot client and Discord API latency',
})
export class PingCommand extends Command {
	public override registerApplicationCommands(registry: Command.Registry) {
		registry.registerChatInputCommand({
			name: this.name,
			description: this.description,
		});
	}

	private buildPingEmbed(message: Message, loading: Interaction): EmbedBuilder {
		return new EmbedBuilder()
			.setAuthor({
				name: `${this.container.client.user?.tag}`,
				iconURL: `${this.container.client.user?.avatarURL()}`,
			})
			.addFields(
				{
					name: '🤖 Client Latency',
					value: codeBlock(`${this.container.client.ws.ping}ms`),
					inline: true,
				},
				{
					name: '📡 API Latency',
					value: codeBlock(
						`${message.createdTimestamp - loading.createdTimestamp}ms`
					),
					inline: true,
				}
			);
	}

	public async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
		const loadingMessage = await interaction.reply({
			content: getLoadingMessage(),
			fetchReply: true,
		});

		return await interaction.editReply({
			content: '',
			embeds: [this.buildPingEmbed(loadingMessage, interaction)],
		});
	}
}
