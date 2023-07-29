import { Listener } from "@sapphire/framework";
import { GuildMember, TextChannel } from "discord.js";

export class GuildMemberRemovalMessage extends Listener {
    public constructor(context: Listener.Context, options: Listener.Options) {
        super(context, {
            ...options,
            event: 'guild'
        })
    }
}