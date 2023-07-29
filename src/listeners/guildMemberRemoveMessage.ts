import { Listener } from "@sapphire/framework";
import { GuildMember, TextChannel } from "discord.js";

export class GuildMemberRemovalMessage extends Listener {
    public constructor(context: Listener.Context, options: Listener.Options) {
        super(context, {
            ...options,
            event: 'guildMemberRemove'
        })
    }

    public async run(member: GuildMember) {
        await (this.container.client.channels.cache.get('1115435350572150807') as TextChannel).send(`${member.user} has left the server.`)
    }
}