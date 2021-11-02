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
const LocaleManager = require("./structures/LocaleManager");
const lookForFiles = require("./util/lookForFiles");
const InteractionListener = require("./structures/InteractionListener");
const ComponentAwaiter = require("./util/ComponentAwaiter");

/**
 * The main interface for Sosamba
 */
class Client extends ErisClient {
    
    constructor(token, options = {}) {
        super(token, options);
        this.log = new Logger({
            level: options.log && options.log.level ? options.log.level : undefined,
            name: "Client"
        });
        this.commands = new Collection(Command);
        this.events = new Collection(Event);
        this.reactionMenus = new Collection(ReactionMenu);
        this.interactionListeners = new Collection(InteractionListener);
        this.componentAwaiter = this.interactionListeners.add(new ComponentAwaiter(this));
        this.memberRequester = new GuildMemberRequester(this);
        this.localeManager = new LocaleManager(this);
        this._loadedCommandsAndEvents = false;
        this._isReady = false;
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

    // DEPRECATED, should be inlined instead
    hasBotPermission(channel, permission) {
        return channel.permissionsOf(this.user.id).has(permission);
    }

    /**
     * 
     * @param {import("eris").Collection<Command>} commands 
     */
    async _registerSlashCommands() {
        /**
         * @type {import("eris").ApplicationCommandStructure[]}
         */
        const discordMapping = this.commands.map(cmd => ({
            name: cmd.name,
            description: cmd.description?.slice(0, 100) || "(no description)",
            options: cmd.args,
            type: 1, // force regular slash command type
            defaultPermission: cmd.defaultPermission ?? undefined
        }));

        this.log.debug("Registering following slash commands:", discordMapping)

        const discordResult = await ((this.options.registerSlashCommandsIn 
            ? this.bulkEditGuildCommands(this.options.registerSlashCommandsIn, discordMapping)
            : this.bulkEditCommands(discordMapping)).catch(err => {
                this.log.error("Cannot register slash commands:")
                this.log.error(err);

                // Switch to a non-promise scope to crash the bot
                process.nextTick(() => {
                    this.emit("error", new Error("Registering commands failed, please check your commands and run the bot again..."));
                });

                return null;
            }));

        if (discordResult === null) return;

        discordResult.forEach(cmd => {
            const c = this.commands.get(cmd.name);
            this.commands.remove(c);
            c.id = cmd.id;

            this.log.debug(`Registered ${c.name} (${c.id}) as a valid command`);
            this.commands.add(c);
        })
    }
}

module.exports = Client;