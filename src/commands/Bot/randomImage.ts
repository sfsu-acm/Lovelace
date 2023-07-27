import { Command } from '@sapphire/framework';
import { randomInt } from 'crypto';
import { Message } from 'discord.js';

export class newCommand extends Command {
    public constructor(context: Command.Context, options: Command.Options) {
        super(context, {
            ...options,
            name: 'randomImage',
            aliases: [],
            description: 'random image max 2000x2000'
        });
    }

    public async messageRun(message: Message) {
        let height: number = randomInt(1, 2000);
        let width: number = randomInt(1, 2000);

        await message.reply(` Your random photo of ${width} by ${height}:`);
        await message.channel.send(`https://picsum.photos/${height}/${width}`);
    }
}