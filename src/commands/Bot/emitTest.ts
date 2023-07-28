import { Command } from "@sapphire/framework";
import { ApplyOptions } from "@sapphire/decorators";
import { GuildMember } from "discord.js";

@ApplyOptions<Command.Options>({
    name: 'emit-guild-add',
	description: 'Emits GUILD_MEMBER_ADD to test welcome message',
})
export class PingCommand extends Command {
	public override registerApplicationCommands(registry: Command.Registry) {
		registry.registerChatInputCommand({
			name: this.name,
			description: this.description,
		});
	}

    public async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
        const guild = this.container.client.guilds.cache.get('1115435349171253360')
        if (guild) {
            const member = guild.members.cache.get('334528824949866497') as GuildMember
            await interaction.reply({content: 'Emitting', ephemeral: true, fetchReply: true})
            this.container.client.emit('guildMemberAdd', member)
        } else {
            await interaction.reply({content: 'Could not find guild or member', ephemeral: true})
        }
    }
}
