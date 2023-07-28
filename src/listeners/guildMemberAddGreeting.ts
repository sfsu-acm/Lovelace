import { Listener } from "@sapphire/framework";
import {GuildMember, TextChannel } from "discord.js";


export class GuildMemberAddGreeting extends Listener {
    public constructor(context: Listener.Context, options: Listener.Options) {
        super(context, {
            ...options,
            event: 'guildMemberAdd',  
            once: false
        });
    }

    public override async run(member: GuildMember) {
        //CHANGE ONCE MOVED TO ACM SERVER
        const channel = this.container.client.channels.cache.get('1115435350060445817') as TextChannel
        await channel.send(`Hi ${member.user}. Welcome to the ACM Discord Server`)
    }
}


