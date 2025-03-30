import { container } from '@sapphire/framework';
import { cyan, yellow } from 'colorette';
import { GuildScheduledEvent, User } from 'discord.js';

type eventQueuesProp = {
  scheduledEvent: GuildScheduledEvent;
  user: User;
  attempts: number;
  maxAttempts: number;
};

/**
 * This queue processes the assignment of custom roles to people
 * that enrolled into a Discord scheduled event. We use this queue
 * to prevent race conditions with the database.
 */
export class EnrollmentQueue {
  private eventQueues: Map<string, eventQueuesProp[]> = new Map();
  private processing: boolean = false;
  private readonly processInterval: number = 1000; // TODO: Change to 10 seconds for prodution

  constructor() {
    setInterval(() => this.processQueues(), this.processInterval);
  }

  /**
   * queueEnrollment
   */
  public queueEnrollment(scheduledEvent: GuildScheduledEvent, user: User) {
    const eventId = scheduledEvent.id;
    if (!this.eventQueues.has(eventId)) {
      this.eventQueues.set(eventId, []);
    }

    this.eventQueues.get(eventId)?.push({
      scheduledEvent,
      user,
      attempts: 0,
      maxAttempts: 5,
    });
    container.client.logger.info(
      `Queued enrollment for user ${yellow(user.username)}[${cyan(user.id)}] for schduled event ${yellow(scheduledEvent.name)}[${eventId}]`,
    );
  }

  /**
   * markEventReady - Manually triggers the enrollment queue process if one isn't
   * already running.
   */
  public markEventReady() {
    this.processQueues();
  }

  /**
   * removeEnrollment
   */
  public removeEnrollment(scheduledEvent: GuildScheduledEvent, user: User) {
    if (!this.eventQueues.has(scheduledEvent.id)) return;

    const queue = this.eventQueues.get(scheduledEvent.id);
    if (!queue) return;

    const index = queue.findIndex((item) => item.user.id === user.id);
    if (index !== -1) {
      queue.slice(index, 1);
      container.client.logger.info(
        `Removed pending enrollment for user ${yellow(user.username)}[${cyan(user.id)}] from the event queue for scheduled event ${yellow(scheduledEvent.name)}[${cyan(scheduledEvent.id)}]`,
      );
      if (queue.length === 0) {
        this.eventQueues.delete(scheduledEvent.id);
      }
    }
  }

  /**
   * clearEventQueue - Clear all pending enrollments for an event
   */
  public clearEventQueue(scheduledEvent: GuildScheduledEvent) {
    if (this.eventQueues.has(scheduledEvent.id)) {
      const count = this.eventQueues.get(scheduledEvent.id)?.length || 0;
      this.eventQueues.delete(scheduledEvent.id);

      container.logger.info(
        `Cleared ${count} pending enrollments for scheduled event ${yellow(scheduledEvent.name)}[${cyan(scheduledEvent.id)}`,
      );
    } else {
      // processQueues() deletes empty queues
      container.logger.info(
        `There wasn't an enrollment queue for scheduled event ${yellow(scheduledEvent.name)}[${cyan(scheduledEvent.id)}`,
      );
    }
  }

  private async processQueues() {
    if (this.processing) return;
    this.processing = true;

    try {
      const { database, client } = container;

      for (const [eventId, queue] of this.eventQueues.entries()) {
        // delete empty queues
        if (queue.length === 0) {
          this.eventQueues.delete(eventId);
          continue;
        }

        const dbEvent = await database.findScheduledEvent(eventId);
        // DB entry for event not ready, log attempt and try again
        if (!dbEvent) {
          // Increment attempt and then skip the entry
          for (const item of queue) {
            item.attempts++;
            // Once max attempts is hit, log failure and remove from queue
            // TODO: Not the perfect solution, but removing from queue after hitting
            // max attempts will prevent an infinitely growing queue. However, we
            // need to record somewhere, other than the logs, who didn't get processed
            // for a role. At this current point, removing them from the enrollmentQueue
            // means they just never get the role.
            if (item.attempts >= item.maxAttempts) {
              client.logger.error(
                `Failed to process enrollment for user ${yellow(item.user.username)}[${cyan(item.user.id)}] for scheduled event ${yellow(item.scheduledEvent.name)}[${cyan(item.scheduledEvent.id)}].`,
                `\nRemoving ${yellow(item.user.username)}[${cyan(item.user.id)}] from enrollment queue.`,
              );
              const index = queue.indexOf(item);
              if (index > -1) queue.splice(index, 1);
            }
          }
          continue;
        }

        // Errors in finding the guild, role, or member does not increment
        // the attempts count.
        for (const item of queue) {
          const { scheduledEvent, user } = item;

          try {
            if (!scheduledEvent.guild) {
              client.logger.error(
                `Failed to find guild from scheduled event ${yellow(scheduledEvent.name)}[${cyan(scheduledEvent.id)}].`,
                '\nCannot proceed with enrollment queue for member.',
              );
              continue; // Skip item since it failed to find a guild
            }

            const role = await scheduledEvent.guild.roles.fetch(dbEvent.roleId);
            if (!role) {
              client.logger.error(
                `Failed to find role associated with scheduled event ${yellow(scheduledEvent.name)} \(${yellow(scheduledEvent.id)}\).`,
                '\nCannot proceed with enrollment queue for member.',
              );
              continue; // skip item since it failed to find role
            }
            // A user may not be a guild member if they enrolled into the scheduled event from an
            // external link to the event. TODO: This behavior needs to be tested.
            const member = await scheduledEvent.guild.members.fetch(user.id);
            if (!member) {
              client.logger.error(
                `Failed to find member in guild (${yellow(scheduledEvent.guild.name)})[${cyan(scheduledEvent.guild.id)}] from user ${yellow(user.username)}[${cyan(user.id)}]`,
                '\nCannot proceed with enrollment queue for member.',
              );
              continue; // skip item since it failed to find member
            }

            await member.roles.add(role);
            client.logger.info(
              `Assigned role ${yellow(role.name)} to guild member ${member.displayName}[${cyan(member.id)}].`,
              'Removing them from the enrollment queue.',
            );
            const index = queue.indexOf(item);
            if (index > -1) queue.splice(index, 1);
          } catch (error) {
            client.logger.error(error);
          }
        }
      }
    } catch (error) {
      container.client.logger.warn(
        'Failed to process a scheduled event in the enrollment queue.',
      );
      container.client.logger.error(error);
    } finally {
      this.processing = false;
    }
  }
}
