import { Listener, container } from '@sapphire/framework';
import { GuildScheduledEvent } from 'discord.js';
import { yellow } from 'colorette';

// TODO: Check behavior of recurring scheduled events
export class CreateEventRole extends Listener {
	public constructor(
		context: Listener.LoaderContext,
		options: Listener.Options,
	) {
		super(context, {
			...options,
			event: 'guildScheduledEventCreate',
			once: false,
		});
	}

	public override async run(scheduledEvent: GuildScheduledEvent) {
		const { client, database } = container;

		try {
			if (!scheduledEvent.guild) {
				return client.logger.error([
					`Failed to find guild from ${scheduledEvent}`,
					'Cannot proceed with creating scheduled event role.',
				]);
			}
			// TODO: Add unique identifier to role name
			const role = await scheduledEvent.guild.roles.create({
				name: `${scheduledEvent.name}`,
				mentionable: true,
				reason: `Role for the scheduled event ${scheduledEvent.name}.`,
			});

			client.logger.info(
				`Created role ${yellow(role.name)} associated with scheduled event ${yellow(scheduledEvent.name)}.`,
			);

			await database.createScheduledEvent(scheduledEvent.id, role.id);

			return client.logger.info(
				`Wrote scheduled event ${yellow(scheduledEvent.name)} into the database.`,
			);
		} catch (error) {
			client.logger.warn(
				'Failed to process custom role creation for new scheduled event.',
			);
			client.logger.error(error);
		}
	}
}
