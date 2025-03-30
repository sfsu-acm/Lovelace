import { Listener, container } from '@sapphire/framework';
import { GuildScheduledEvent } from 'discord.js';
import { cyan, yellow } from 'colorette';

export class OnEventCreate extends Listener {
  public constructor(
    context: Listener.LoaderContext,
    options: Listener.Options,
  ) {
    super(context, {
      ...options,
      event: 'guildScheduledEventCreate',
    });
  }

  public override async run(scheduledEvent: GuildScheduledEvent) {
    const { client, database, enrollmentQueue } = container;

    try {
      if (!scheduledEvent.guild) {
        return client.logger.error(
          `Failed to find guild from scheduled event ${yellow(scheduledEvent.name)}[${cyan(scheduledEvent.id)}].`,
          '\nCannot proceed with creating scheduled event role.',
        );
      }
      // TODO: Add unique identifier to role name
      const role = await scheduledEvent.guild.roles.create({
        name: `${scheduledEvent.name}`,
        mentionable: true,
        reason: `Role for the scheduled event ${scheduledEvent.name}.`,
        permissions: [], // No permissions for these custom roles
      });

      client.logger.info(
        `Created role ${yellow(role.name)} associated with scheduled event ${yellow(scheduledEvent.name)}.`,
      );

      const result = await database.createScheduledEvent(
        scheduledEvent.id,
        role.id,
      );
      // Once db entry for event is created, mark it in enrollment queue as ready for processing
      // then queue the event creator up for enrollment.
      if (result.affectedRows > 0) {
        enrollmentQueue.markEventReady();
        client.logger.info(
          `Wrote scheduled event ${yellow(scheduledEvent.name)}[${cyan(scheduledEvent.id)}] into the database.`,
          'Marked scheduled event ready for enrollment queue.',
        );
        if (scheduledEvent.creator) {
          enrollmentQueue.queueEnrollment(
            scheduledEvent,
            scheduledEvent.creator,
          );
        }
      } else {
        client.logger.error(
          `Failed to write scheduled event ${yellow(scheduledEvent.name)}[${cyan(scheduledEvent.id)}] into the database.`,
        );
      }
    } catch (error) {
      client.logger.warn(
        'Failed to process OnEventCreate for new scheduled event.',
      );
      client.logger.error(error);
    }
  }
}
