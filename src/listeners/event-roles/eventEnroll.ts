import { Listener, container } from '@sapphire/framework';
import { GuildScheduledEvent, User } from 'discord.js';
import { yellow, cyan } from 'colorette';

export class OnEventEnroll extends Listener {
	public constructor(
		context: Listener.LoaderContext,
		options: Listener.Options,
	) {
		super(context, {
			...options,
			event: 'guildScheduledEventUserAdd',
		});
	}

	public override async run(scheduledEvent: GuildScheduledEvent, user: User) {
		const { client, database } = container;

		try {
			if (!scheduledEvent.guild) {
				return client.logger.error(
					`Failed to find guild from scheduled event ${yellow(scheduledEvent.name)}[${cyan(scheduledEvent.id)}].`,
					'Cannot proceed with assigning event role.',
				);
			}

			const dbEvent = await database.findScheduledEvent(scheduledEvent.id);
			if (!dbEvent) {
				return client.logger.error(
					`Failed to find the database entry for ${yellow(scheduledEvent.name)}[${scheduledEvent.id}]`,
					// TODO: Find a more elegant way to handle this than to just log the possibility that the db entry doesn't exists
					// TODO: Related issue, make sure the author of the event is also assigned the role
					'\nThis is due to userAdd and eventCreate events emitting at the same timee, but userAdd needs the db entry made by eventCreate.',
					'Cannot proceed with assigning event role.',
				);
			}

			const role = await scheduledEvent.guild.roles.fetch(dbEvent.roleId);
			if (!role) {
				return client.logger.error([
					`Failed to find role associated with scheduled event ${yellow(scheduledEvent.name)}[${cyan(scheduledEvent.id)}].`,
					'Cannot proceed with assigning event role.',
				]);
			}

			const member = await scheduledEvent.guild.members.fetch(user.id);
			// A user may not be a guild member if they enrolled into the scheduled event from an
			// external link to the event. TODO: This behavior needs to be tested.
			if (!member) {
				return client.logger.error(
					// user.toString() prints <@123456789012345678>
					`Failed to find member in guild (${yellow(scheduledEvent.guild.name)})[${cyan(scheduledEvent.guild.id)}] from user ${yellow(user.username)}[${cyan(user.id)}]`,
					'\nCannot proceed with assigning event role.',
				);
			}
			await member.roles.add(role);
			client.logger.info(
				`Assigned role ${yellow(role.name)} to guild member ${member.displayName}[${cyan(member.id)}]`,
			);
		} catch (error) {
			client.logger.error(error);
		}
		// Fetch corresponding custom event role by id from the database
		//
		// Assign role to user
		//
		// What if role doesn't exist?
	}
}
