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
		// Most of the logic in here has been moved to the EnrollmentQueue
		const { client, enrollmentQueue } = container;

		if (!scheduledEvent.guild) {
			return client.logger.error(
				`Failed to find guild from scheduled event ${yellow(scheduledEvent.name)}[${cyan(scheduledEvent.id)}].`,
				'Cannot proceed with assigning event role.',
			);
		}

		if (!user) {
			return client.logger.error(
				`Failed to find user enrolling into scheduled event ${yellow(scheduledEvent.name)}[${cyan(scheduledEvent.id)}].`,
				'Cannot proceed with assigning event role.',
			);
		}

		enrollmentQueue.queueEnrollment(scheduledEvent, user);
	}
}
