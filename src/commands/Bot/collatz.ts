import { Command } from '@sapphire/framework';
import { ApplyOptions } from '@sapphire/decorators';

@ApplyOptions<Command.Options>({
	description:
		'Applies the rules of the collatz conjecture to determine whether it will result in a cycle or not.',
})
export class CollatzCommand extends Command {
	public constructor(context: Command.Context, options: Command.Options) {
		super(context, {
			...options,
			name: 'Collatz Conjecture',
			description:
				'Applies the rules of the collatz conjecture to determine whether it will result in a cycle or not.',
		});
	}

	public override registerApplicationCommands(registry: Command.Registry) {
		registry.registerChatInputCommand((builder) => {
			builder
				.setName('collatz')
				.setDescription(this.description)
				.addIntegerOption((option) =>
					option
						.setName('input')
						.setDescription('Number to use conjecture on')
						.setRequired(true)
				);
		});
	}

	public async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
		if (interaction.options.getInteger('input')! < 2) {
			return await interaction.reply({
				content: 'Pick a number greater than or equal to 2.',
				ephemeral: true,
				fetchReply: true,
			});
		}
		let input = interaction.options.getInteger('input')!;
		const originalInput = input;

		const sequenceSet = new Set<number>();

		while (input != 1 || !sequenceSet.has(input)) {
			// Condition when input is even
			if (input % 2 == 0) {
				input /= 2;
			} else {
				input = 3 * input + 1;
			}
			sequenceSet.add(input);
		}

		const formattedSequence = 'Collatz Sequence: ' + [...sequenceSet].join(' ');

		// Case in which input doe eqaul one then return string with sequence
		if (input == 1) {
			return await interaction.reply(
				`This ${originalInput} ends at 1 without creating a loop. The ${formattedSequence}`
			);
		} else {
			// The case in which we got a repeat
			return await interaction.reply(
				`${originalInput} will be stuck in an infinite cycle.`
			);
		}
	}
}
