import type {
	ChatInputCommandSuccessPayload,
	Command,
	ContextMenuCommandSuccessPayload,
	MessageCommandSuccessPayload,
} from '@sapphire/framework';
import type {
	Collection,
	NonThreadGuildBasedChannel,
	Channel
} from 'discord.js';
import { container } from '@sapphire/framework';
import { send } from '@sapphire/plugin-editable-commands';
import { cyan } from 'colorette';
import { EmbedBuilder, Guild, Message, User, type APIUser } from 'discord.js';
import { RandomLoadingMessage } from './constants';

/**
 * Finds a text channel based on a channel ID
 * 
 * @param channelId Text channel ID
 */
export async function findTextChannel(channelId: string): Promise<Channel | null>;

/**
 * Finds text channels in a guild with a given name
 *
 * @param {Guild} guild The guild object to search through
 * @param channelName The name of the channel to look for
 */
export async function findTextChannel(guild: Guild, channelName: string): Promise<Collection<string, NonThreadGuildBasedChannel | null>>;

export async function findTextChannel(
  guildOrId: Guild | string, 
  channelName?: string
): Promise<Channel | null | Collection<string, NonThreadGuildBasedChannel | null>> {
  if (typeof guildOrId === 'string') {
    // First overload: Find by channel ID
    return container.client.channels.fetch(guildOrId);
  } else {
    // Second overload: Find by name in guild
    const channelManager = guildOrId.channels;
    const channels = await channelManager.fetch();
    return channels.filter(channel => channel?.name === channelName);
  }
}

/**
 * Picks a random item from an array
 * @param array The array to pick a random item from
 * @example
 * const randomEntry = pickRandom([1, 2, 3, 4]) // 1
 */
export function pickRandom<T>(array: readonly T[]): T {
	const { length } = array;
	return array[Math.floor(Math.random() * length)];
}

/**
 * Provides a random loading message
 * @returns A random loading message
 */
export function getLoadingMessage(): string {
	return pickRandom(RandomLoadingMessage);
}

/**
 * Sends a loading message to the current channel
 * @param message The message data for which to send the loading message
 */
export function sendLoadingMessage(message: Message): Promise<typeof message> {
	return send(message, {
		embeds: [
			new EmbedBuilder()
				.setDescription(pickRandom(RandomLoadingMessage))
				.setColor('#FF0000'),
		],
	});
}

export function logSuccessCommand(
	payload:
		| ContextMenuCommandSuccessPayload
		| ChatInputCommandSuccessPayload
		| MessageCommandSuccessPayload,
): void {
	let successLoggerData: ReturnType<typeof getSuccessLoggerData>;

	if ('interaction' in payload) {
		successLoggerData = getSuccessLoggerData(
			payload.interaction.guild,
			payload.interaction.user,
			payload.command,
		);
	} else {
		successLoggerData = getSuccessLoggerData(
			payload.message.guild,
			payload.message.author,
			payload.command,
		);
	}

	container.logger.debug(
		`${successLoggerData.shard} - ${successLoggerData.commandName} ${successLoggerData.author} ${successLoggerData.sentAt}`,
	);
}

export function getSuccessLoggerData(
	guild: Guild | null,
	user: User,
	command: Command,
) {
	const shard = getShardInfo(guild?.shardId ?? 0);
	const commandName = getCommandInfo(command);
	const author = getAuthorInfo(user);
	const sentAt = getGuildInfo(guild);

	return { shard, commandName, author, sentAt };
}

function getShardInfo(id: number) {
	return `[${cyan(id.toString())}]`;
}

function getCommandInfo(command: Command) {
	return cyan(command.name);
}

function getAuthorInfo(author: User | APIUser) {
	return `${author.username}[${cyan(author.id)}]`;
}

function getGuildInfo(guild: Guild | null) {
	if (guild === null) return 'Direct Messages';
	return `${guild.name}[${cyan(guild.id)}]`;
}
