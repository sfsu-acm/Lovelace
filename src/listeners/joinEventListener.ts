import { Command, Listener } from "@sapphire/framework";
import { ChatInputCommandInteraction, Client, CommandInteraction, TextChannel } from "discord.js";


export class RawGuildMemberAddListener extends Listener {
    public constructor(context: Listener.Context, options: Listener.Options) {
        super(context, {
            ...options,
            emitter: 'ws',
            event: 'GUILD_MEMBER_ADD',
            once: false
        });
    }

    public override async run(client: Client) {
        //Create message
        if (client.user) {
            const {username, id} = client.user!;
            await (client.channels.cache.get('greet') as TextChannel).send(`Hi @${client.user.tag}. Welcome to the ACM Discord!`)
        }
    }
}


