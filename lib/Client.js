"use strict";
const { Client: ErisClient, Collection } = require("eris");
const Event = require("./structures/Event");
const Command = require("./structures/Command");
const InternalCommand = require("./util/InternalCommand");
const MessageListener = require("./structures/MessageListener");
const MessageAwaiter = require("./util/MessageAwaiter");
const GuildMemberRequester = require("./util/GuildMemberRequester");
const Logger = require("./util/Logger");
const { join } = require("path");
const ReactionMenu = require("./structures/ReactionMenu");
const lookForFiles = require("./util/lookForFiles");
const i18n = require("./util/I18N");

/**
 * The main interface for Sosamba
 */
class Client extends ErisClient {
    
    constructor(token, options = {}) {
        super(token, options);
        if (!this.options.prefix) {
            throw new Error("Missing options.prefix");
        }
        this.log = new Logger({
            level: options.log && options.log.level ? options.log.level : undefined,
            name: "Client"
        });
        this.commands = new Collection(Command);
        this.events = new Collection(Event);
        this.reactionMenus = new Collection(ReactionMenu);
        this.messageListeners = new Collection(MessageListener);
        this.messageAwaiter = this.messageListeners.add(new MessageAwaiter(this));
        this.memberRequester = new GuildMemberRequester(this);
        this.i18n = new i18n(this);
        this._loadedCommandsAndEvents = false;
    }

    async connect(loadCommandsAndEvents = true) {
        if (loadCommandsAndEvents && !this._loadedCommandsAndEvents) {
            await this.loadEvents(join(__dirname, "events"));
            await this.loadEvents();
            await this.loadCommands(join(__dirname, "commands"));
            await this.loadCommands();
            this._loadedCommandsAndEvents = true;
        }
        return super.connect();
    }

    async loadEvents(path = join(process.cwd(), "events")) {
        return await lookForFiles(path, this.events, this, Event);
    }

    async loadCommands(path = join(process.cwd(), "commands")) {
        return await lookForFiles(path, this.commands, this, Command, InternalCommand);
    }

    async getPrefix(ctx) {
        if (typeof this.options.prefix === "string" || Array.isArray(this.options.prefix)) return this.options.prefix;
        else {
            let prefix = await this.options.prefix(ctx, this);
            if (typeof prefix !== "string" && !Array.isArray(prefix)) prefix = prefix.toString(); // And let's hope there's no disruption
            return prefix;
        }
    }

    hasBotPermission(channel, permission) {
        return channel.permissionsOf(this.user.id).has(permission);
    }
}

module.exports = Client;