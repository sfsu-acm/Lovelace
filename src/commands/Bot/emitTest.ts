import { Command } from "@sapphire/framework";
import { ApplyOptions } from "@sapphire/decorators";
import { isMessageInstance } from "@sapphire/discord.js-utilities";
import { GuildMember } from "discord.js";
import { EventEmitter } from "events";


@ApplyOptions<Command.Options>({
    name: 'emit-guild-add',
	description: 'Emits GUILD_MEMBER_ADD to test welcome message',
    aliases: ['kick'],
    requiredUserPermissions: "Administrator"
})
export class PingCommand extends Command {
	public override registerApplicationCommands(registry: Command.Registry) {
		registry.registerChatInputCommand({
			name: this.name,
			description: this.description,
		});
	}

    public async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
        const msg = await interaction.reply({content: "emit", ephemeral: true, fetchReply: true});
        
        if (isMessageInstance(msg)) {
            //Emmits GUILD_MEMBER_ADD event to test the joinEventListener
            const emitter = new EventEmitter();
            await emitter.emit("GUILD_MEMBER_ADD", GuildMember);
            return await interaction.reply(`Event Emitted`);
        } 
    }
}
