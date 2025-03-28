import { Listener, container } from '@sapphire/framework';
import { GuildScheduledEvent } from 'discord.js';
import { yellow } from 'colorette';

export class DeleteEventRoleOnComplete extends Listener {
	public constructor(
		context: Listener.LoaderContext,
		options: Listener.Options,
	) {
		super(context, {
			...options,
			event: 'guildScheduledEventUpdate',
			once: false,
		});
	}

	public override async run(
		_oldScheduleEvent: GuildScheduledEvent,
		newScheduledEvent: GuildScheduledEvent,
	) {
		if (!newScheduledEvent.isCompleted()) return;

		const { client, database } = container;

		try {
			if (!newScheduledEvent.guild) {
				return client.logger.error(
					`Failed to find guild from ${newScheduledEvent}`,
				);
			}
			const dbEvent = await database.findScheduledEvent(newScheduledEvent.id);
			const role = await newScheduledEvent.guild.roles.fetch(dbEvent.roleId);

			if (!role) {
				client.logger.error(
					`Failed to find role associated with scheduled event ${yellow(newScheduledEvent.name)} \(${yellow(newScheduledEvent.id)}\). Attempting to delete corresponding database entry.`,
				);
			} else {
				client.logger.info(
					`Deleted role ${yellow(role.name)} associated with ${yellow(newScheduledEvent.name)}`,
				);
				await role.delete(
					`Deleted role associated with scheduled event ${newScheduledEvent.name} that has ended.`,
				);
			}

			const deleteResult = await database.deleteScheduledEvent(
				newScheduledEvent.id,
			);
			// Schema eventId row contains unique values only, so deleting should affect
			// only 1 or 0 rows
			if (deleteResult.affectedRows > 0) {
				client.logger.info(
					`Deleted database entry for ${yellow(newScheduledEvent.name)}`,
				);
			} else {
				client.logger.warn(
					`Failed to find a database entry for ${yellow(newScheduledEvent.name)} \(${yellow(newScheduledEvent.id)}\)`,
				);
			}
		} catch (error) {
			return client.logger.error(error);
		}
	}
}
