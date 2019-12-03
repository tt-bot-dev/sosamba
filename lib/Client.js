"use strict";
const { Client: ErisClient, Collection } = require("eris");
const Event = require("./structures/Event");
const Command = require("./structures/Command");
const InternalCommand = require("./util/InternalCommand");
const MessageListener = require("./structures/MessageListener");
const MessageAwaiter = require("./util/MessageAwaiter");
const { promises } = require("fs");
const Logger = require("./util/Logger");
const { join } = require("path");
const ReactionMenu = require("./structures/ReactionMenu");
const _req = require;
const i18n = require("./util/I18N");

class Client extends ErisClient {
    
    constructor(token, options = {}) {
        super(token, options);
        this.log = new Logger({
            stdout: [process.stdout, ...((options.log && options.log.stdout) || [])],
            stderr: [process.stderr, ...((options.log && options.log.stderr) || [])],
            level: (options.log && options.log.level) ? options.log.level : undefined,
            name: "Client"
        });
        this.commands = new Collection(Command);
        this.events = new Collection(Event);
        this.reactionMenus = new Collection(ReactionMenu);
        this.messageListeners = new Collection(MessageListener);
        this.messageAwaiter = this.messageListeners.add(new MessageAwaiter(this));
        this.i18n = new i18n(this);
    }

    async connect() {
        await this.loadEvents(join(__dirname, "events"));
        await this.loadEvents();
        await this.loadCommands(join(__dirname, "commands"));
        await this.loadCommands();
        return super.connect();
    }

    async loadEvents(path = join(process.cwd(), "events")) {
        let events;
        try {
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
                    f = _req(fullPath);
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
                    f = _req(fullPath);
                } catch(e) {
                    this.log.error(`Error loading the command located at ${fullPath}:\n`, e);
                    return e;
                }
                if (!(f.prototype instanceof Command)) {
                    this.log.error(`The command located at ${fullPath} is not an instance of the Command class, ignoring.`);
                    return new Error("The command is not an instance of the Command class.");
                }
                const cmdClass = new f(this, d.name, path);
                cmdClass.mount();
                const a = this.commands.add(cmdClass);
                if (cmdClass !== a) {
                    // Replace the internal commands
                    if (a instanceof InternalCommand) {
                        a.unmount();
                        this.commands.add(cmdClass);
                    } else {
                        this.log.error(`The command class ${cmdClass.constructor.name} at ${fullPath} uses the same command name ${cmdClass.id} and the class name that has been first loaded at ${join(a.path, a.file)}. In order to solve this, please use a different command name.`);
                        cmdClass.unmount();
                        return new Error("The command conflicts with another command.");
                    }
                }
                this.log.info(`The command located at ${fullPath} is loaded.`);
            }
        }));
    }

    async getPrefix(ctx) {
        if (typeof this.options.prefix === "string" || Array.isArray(this.options.prefix)) return this.options.prefix;
        else {
            let prefix;
            try {
                // The function might be in another scope
                prefix = await this.options.prefix(ctx, this);
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

module.exports = Client;