"use strict";
const { Client, Collection } = require("eris");
const Event = require("./structures/Event");
const Command = require("./structures/Command");
const { promises } = require("fs");
const Logger = require("./util/Logger");
const { join } = require("path");
const ReactionMenu = require("./structures/ReactionMenu");

/**
 * The client from Eris
 * @external Client
 * @see {@link https://abal.moe/Eris/docs/Client}
 */
/**
 * The client options from Eris
 * @external ClientOptions
 * @see {@link https://abal.moe/Eris/docs/Client}
 */
/**
 * A node.js writable stream
 * @external Writable
 * @see {@link https://nodejs.org/api/stream.html#stream_writable_streams}
 */

/**
 * A message from Eris
 * @external Message
 * @see {@link https://abal.moe/Eris/docs/Message}
 */

/**
 * A guild from Eris
 * @external Guild
 * @see {@link https://abal.moe/Eris/docs/Guild}
 */

 
/**
 * A text channel from Eris
 * @external TextChannel
 * @see {@link https://abal.moe/Eris/docs/TextChannel}
 */

/**
 * An user from Eris
 * @external User
 * @see {@link https://abal.moe/Eris/docs/User}
 */
/**
 * A member from Eris
 * @external Member
 * @see {@link https://abal.moe/Eris/docs/Member}
 */
/**
 * An Eris collection
 * @external Collection
 * @see {@link https://abal.moe/Eris/docs/Collection}
 */

/**
 * The main entry point for Sosamba
 * @prop {Logger} log The client log
 * @prop {Collection<Command>} commands The commands that have been loaded by Sosamba
 * @prop {Collection<Event>} events The events that have been loaded by Sosamba
 * @extends {external:Client}
 */
class SosambaClient extends Client {
    /**
     * Sosamba client options
     * @typedef {object} SosambaClientOptions
     * @memberof SosambaClient
     * @extends {external:ClientOptions}
     * @property {LoggingOptions} log The logging options
     */

    /**
      * The logging options for Sosamba
      * @typedef {object} LoggingOptions
      * @memberof SosambaClient
      * @property {external:Writable[]} [stdout=[process.stdout]] The streams used as stdout. Omit to use process.stdout
      * @property {external:Writable[]} [stderr=[process.stderr]] The streams used as stderr. Omit to use process.stderr
      * @property {string[]} level The logging levels
      */

    /**
     * The client constructor, accepts same parameters as Eris' one.
     * @param {string} token The client token
     * @param {SosambaClientOptions} options The options of the client
     * @see {@link https://abal.moe/Eris/docs/Client|Eris documentation about the client options.}
     */
    constructor(token, options) {
        super(token, options);
        /**
         * The logger used by the client.
         * @type {Logger}
         */
        this.log = new Logger({
            stdout: [process.stdout, ...(options.log.stdout || [])],
            stderr: [process.stderr, ...(options.log.stderr || [])],
            level: options.log.level ? options.log.level : undefined,
            name: "SosambaClient"
        });

        /**
         * A collection that holds all the commands
         * @type {external:Collection<Command>}
         */
        this.commands = new Collection(Command);
        
        /**
         * A collection that holds all the events
         * @type {external:Collection<Event>}
         */
        this.events = new Collection(Event);

        /**
         * A collection that holds all the reaction menu callbacks
         * @type {external:Collection<Event>}
         */
        this.reactionMenus = new Collection(ReactionMenu);
    }
    /**
     * Fired when an error occurs in an event
     * @event SosambaClient#sosambaEventError
     * @prop {Error} err The event error
     */

    /**
     * Fired when an error occurs in a command. When there are no listeners for this event,
     * a message about the error is sent to the Discord channel.
     * @event SosambaClient#sosambaCommandError
     * @prop {Error} err The command error
     */

    /**
     * Connects to Discord and loads the events and commands.
     * @returns {Promise} A promise returned from Eris' client connect method
     */
    async connect() {
        await this.loadEvents();
        await this.loadEvents(join(__dirname, "events"));
        await this.loadCommands();
        return super.connect();
    }

    /**
     * Load events from somewhere else
     * @param {string} [path=`${process.cwd()}/events`] The path to your events
     * @return {Promise} A promise that resolves with nothing
     */
    async loadEvents(path = join(process.cwd(), "events")) {
        let events;
        try{
            events = await promises.readdir(path, {
                withFileTypes: true
            });
        } catch {
            events = [];
            await promises.mkdir(path);
        } 
        return Promise.all(events.map(async d => {
            const fullPath = join(path, d.name);
            if (d.isDirectory()) {
                this.log.debug(`Hit a directory at ${fullPath}`);
                await this.loadEvents(fullPath);
            } else {
                let f;
                try {
                    f = require(fullPath);
                } catch(e) {
                    this.log.error(`Error loading the event located at ${fullPath}:\n`, e);
                    return;
                }
                if (!(f.prototype instanceof Event)) {
                    this.log.error(`The event located at ${fullPath} is not an instance of the Event class, ignoring.`);
                    return;
                }
                const evtClass = new f(this, d.name, path);
                evtClass.mount();
                const a = this.events.add(evtClass);
                if (evtClass !== a) {
                    this.log.error(`The event ${evtClass.constructor.name} at ${fullPath} uses the same event name ${evtClass.evtName} and the class name that has been first loaded at ${join(a.path, a.file)}. In order to solve this, please use a different class name.`);
                    evtClass.unmount();
                    return;
                }
                this.log.info(`The event ${evtClass.constructor.name} at ${fullPath} is loaded.`);
            }
        }));
    }

    /**
     * Load the commands from somewhere else
     * @param {string} [path=`${process.cwd()}/commands`] The path to your commands
     * @returns {Promise} A promise that resolves with nothing
     */
    async loadCommands(path = join(process.cwd(), "commands")) {
        let commands;
        try {
            commands = await promises.readdir(path, {
                withFileTypes: true
            });
        } catch {
            await promises.mkdir(path);
            commands = [];
        }
        return Promise.all(commands.map(async d => {
            const fullPath = join(path, d.name);
            if (d.isDirectory()) {
                this.log.debug(`Hit a directory at ${fullPath}`);
                await this.loadCommands(fullPath);
            } else {
                let f;
                try {
                    f = require(fullPath);
                } catch(e) {
                    this.log.error(`Error loading the command located at ${fullPath}:\n`, e);
                    return;
                }
                if (!(f.prototype instanceof Command)) {
                    this.log.error(`The command located at ${fullPath} is not an instance of the Command class, ignoring.`);
                    return;
                }
                const cmdClass = new f(this, d.name, path);
                cmdClass.mount();
                const a = this.commands.add(cmdClass);
                if (cmdClass !== a) {
                    this.log.error(`The command class ${cmdClass.constructor.name} at ${fullPath} uses the same command name ${cmdClass.id} and the class name that has been first loaded at ${join(a.path, a.file)}. In order to solve this, please use a different command name.`);
                    cmdClass.unmount();
                    return;
                }
                this.log.info(`The command located at ${fullPath} is loaded.`);
            }
        }));
    }

    /**
     * Get the prefix(es) based on a message
     * @param {external:Message} msg The {@link https://abal.moe/Eris/docs/Message|Eris message} to get the prefix(es) for
     * @returns {string|string[]} The string or an array of strings that will be used as the prefix(es).
     */
    getPrefix(msg) {
        if (typeof this.options.prefix === "string" || Array.isArray(this.options.prefix)) return this.options.prefix;
        else {
            let prefix;
            try {
                // The function might be in another scope
                prefix = this.options.prefix(msg, this);
            } catch(e) {
                throw e;
            }
            if (typeof prefix !== "string" && !Array.isArray(prefix)) prefix = prefix.toString(); // And let's hope there's no disruption
            return prefix;
        }
    }

    hasBotPermission(channel, permission) {
        return channel.permissionsOf(this.user.id).has(permission);
    }
}

module.exports = SosambaClient;