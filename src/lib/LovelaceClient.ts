import { SapphireClient } from "@sapphire/framework";
import { ClientOptions } from "discord.js";

export class LovelaceClient extends SapphireClient {

    constructor(options: ClientOptions) {
        super(options)
    }

    public override login(token?: string): Promise<string> {
        return super.login(token)
    }

    public override destroy(): Promise<void> {
        return super.destroy()
    }

}
