import { Command, Listener } from "@sapphire/framework";
import { ChatInputCommandInteraction, Client, CommandInteraction } from "discord.js";


export class RawGuildMemberAddListener extends Listener {
    public constructor(context: Listener.Context, options: Listener.Options) {
        super(context, {
            ...options,
            emitter: 'ws',
            event: 'GUILD_MEMBER_ADD',
            once: false
        });
    }

    public override async run(client: Client, interaction: Command.ChatInputCommandInteraction) {
        //Create message
        if (client.user) {
            const {username, id} = client.user!;
            await interaction.reply(`Welcome @${client.user.tag}! Welcome to the ACM discord`)
        }
    }
}


