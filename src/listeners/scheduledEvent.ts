import { ApplyOptions } from "@sapphire/decorators";
import { Listener, ListenerOptions } from "@sapphire/framework";
import { GuildScheduledEvent } from "discord.js";

@ApplyOptions<ListenerOptions>({})
export class ScheduledEventListener extends Listener {
  public constructor(context: Listener.Context, options: Listener.Options) {
    super(context, {
      ...options,
      event: 'guildScheduledEventCreate'
    });
  }

	public async run(event: GuildScheduledEvent) {
    const newRoleName = `${event.name}}`
		console.log(newRoleName)
	}
}