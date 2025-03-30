import { Listener, container } from '@sapphire/framework';
import { GuildScheduledEvent, User } from 'discord.js';
import { yellow, cyan } from 'colorette';

export class OnEventDrop extends Listener {
  public constructor(
    context: Listener.LoaderContext,
    options: Listener.Options,
  ) {
    super(context, {
      ...options,
      event: 'guildScheduledEventUserRemove',
    });
  }

  public override async run(scheduledEvent: GuildScheduledEvent, user: User) {
    const { client, database, enrollmentQueue } = container;

    try {
      if (!scheduledEvent.guild) {
        return client.logger.error(
          `Failed to find guild from scheduled event ${yellow(scheduledEvent.name)}[${cyan(scheduledEvent.id)}].`,
          '\nCannot proceed with removing event role from member.',
        );
      }

      if (!user) {
        return client.logger.error(
          `Failed to find user enrolling into scheduled event ${yellow(scheduledEvent.name)}[${cyan(scheduledEvent.id)}].`,
          'Cannot proceed with removing event role from member.',
        );
      }

      enrollmentQueue.removeEnrollment(scheduledEvent, user);
      const dbEvent = await database.findScheduledEvent(scheduledEvent.id);
      const role = await scheduledEvent.guild.roles.fetch(dbEvent.roleId);

      if (!role) {
        return client.logger.error(
          `Failed to find role associated with scheduled event ${yellow(scheduledEvent.name)}[${cyan(scheduledEvent.id)}].`,
          '\nCannot proceed with removing event role from member.',
        );
      }

      const member = await scheduledEvent.guild.members.fetch(user.id);
      // A user may not be a guild member if they dropped the scheduled event from an
      // external link to the event. TODO: This behavior needs to be tested.
      if (!member) {
        return client.logger.error(
          // user.toString() prints <@123456789012345678>
          `Failed to find member in guild (${yellow(scheduledEvent.guild.id)}) from user ${yellow(user.toString())}`,
          '\nCannot proceed with removing event role from member.',
        );
      }
      // Attempts to remove the role whether the member has it or not, no error regardless.
      // No use in checking first if no error is thrown, because that'd just be an additional call to Discord.
      await member.roles.remove(role);
      client.logger.info(
        `Removed role ${yellow(role.name)} from guild member ${member.displayName}[${cyan(member.id)}]`,
      );
    } catch (error) {
      client.logger.error(error);
    }
  }
}
