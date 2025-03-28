import { Listener, container } from '@sapphire/framework';
import { GuildScheduledEvent } from 'discord.js';
import { yellow } from 'colorette';

export class DeleteEventRoleOnDelete extends Listener {
  public constructor(
    context: Listener.LoaderContext,
    options: Listener.Options,
  ) {
    super(context, {
      ...options,
      event: 'guildScheduledEventDelete',
      once: false,
    });
  }

  public override async run(scheduledEvent: GuildScheduledEvent) {
    const { client, database } = container;

    try {
      if (!scheduledEvent.guild) {
        return client.logger.error([
          `Failed to find guild from ${scheduledEvent}`,
          'Cannot proceed with deleting event role',
        ]);
      }

      const dbEvent = await database.findScheduledEvent(scheduledEvent.id);
      const role = await scheduledEvent.guild.roles.fetch(dbEvent.roleId);
      // A role may not exist prior to the bot deleting the event (role was manually deleted)
      // Delete the role if found, otherwise log that the role was deleted and proceed to
      // delete the database entry
      if (!role) {
        client.logger.error(
          `Failed to find role associated with scheduled event ${yellow(scheduledEvent.name)} \(${yellow(scheduledEvent.id)}\). Attempting to delete corresponding database entry.`,
        );
      } else {
        await role.delete(
          `Deleted role associated with scheduled event ${scheduledEvent.name} that has ended.`,
        );
        // TODO: Do we need to check if role deletion was successful?
        client.logger.info(
          `Deleted role ${yellow(role.name)} associated with scheduled event ${yellow(scheduledEvent.name)}`,
        );
      }

      const deleteResult = await database.deleteScheduledEvent(
        scheduledEvent.id,
      );
      // Schema eventId column contains unique values only, so deleting should affect
      // only 1 or 0 rows
      if (deleteResult.affectedRows > 0) {
        client.logger.info(
          `Deleted database entry for scheduled event ${yellow(scheduledEvent.name)}`,
        );
      } else {
        client.logger.warn(
          `Failed to find a database entry for scheduled event ${yellow(scheduledEvent.name)} \(${yellow(scheduledEvent.id)}\)`,
        );
      }
    } catch (error) {
      return client.logger.error(error);
    }
  }
}
