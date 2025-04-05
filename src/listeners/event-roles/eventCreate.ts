/**
 * @file OnEventCreate.ts
 * @description Listener for handling Discord scheduled event creation.
 * Creates associated roles and database entries for scheduled events.
 */

import { Listener, container } from '@sapphire/framework';
import { Events, GuildScheduledEvent } from 'discord.js';
import { cyan, yellow } from 'colorette';
import { Timestamp } from '@sapphire/timestamp';
import { reasonableTruncate } from '../../lib/utils';

/**
 * Listener that handles the creation of Discord scheduled events.
 * Performs setup tasks including:
 * - Creating an custom role associated with the event
 * - Creating a database entry to track the event and custom role
 * - Queue event author to get the custom role
 */
export class OnEventCreate extends Listener {
  /**
   * Creates a new OnEventCreate listener
   * @param context - The loader context
   * @param options - The listener options
   */
  public constructor(
    context: Listener.LoaderContext,
    options: Listener.Options,
  ) {
    super(context, {
      ...options,
      event: Events.GuildScheduledEventCreate,
    });
  }

  /**
   * Handles the scheduled event creation
   * Creates a role for the event, records it in the database, and queues the event creator for enrollment
   * @param scheduledEvent - The newly created scheduled event
   */
  public override async run(scheduledEvent: GuildScheduledEvent) {
    const { client, database, enrollmentQueue } = container;
    try {
      if (!scheduledEvent.guild) {
        return client.logger.error(
          `Failed to find guild from scheduled event ${yellow(scheduledEvent.name)}[${cyan(scheduledEvent.id)}].`,
          '\nCannot proceed with creating scheduled event role.',
        );
      }

      // Add timestamp to role name as a unique identifier
      const start = scheduledEvent.scheduledStartAt || new Date(0);
      const timestamp = new Timestamp('MMM-DD HH:mm');
      const role = await scheduledEvent.guild.roles.create({
        name: `${reasonableTruncate(scheduledEvent.name)} [${timestamp.display(start)}]`,
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
          `Wrote scheduled event ${yellow(scheduledEvent.name)} [${cyan(scheduledEvent.id)}] into the database.`,
          'Marked scheduled event ready for enrollment queue.',
        );
        if (scheduledEvent.creator) {
          enrollmentQueue.queueAssignment(
            scheduledEvent,
            scheduledEvent.creator,
          );
        }
      } else {
        client.logger.error(
          `Failed to write scheduled event ${yellow(scheduledEvent.name)} [${cyan(scheduledEvent.id)}] into the database.`,
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
