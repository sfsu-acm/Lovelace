import { Command } from "@sapphire/framework";
import { Message } from "discord.js";
export class RickRollCommand extends Command {
    public constructor(context: Command.Context, options: Command.Options) {
        super(context, {
          ...options,
          name: 'rickroll',
          aliases: ['surprise'],
          description: 'rickrolls you'
        });
      }
    public async messageRun(message: Message) {
        const msg = await message.channel.send('surprise');
        const content = "Never gonna give you up... never gonna let you down... ";
        return msg.edit(content);
    }
}