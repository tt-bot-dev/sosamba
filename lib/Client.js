const { Client, Collection } = require("eris");
const Event = require("./Event");
const { promises } = require("fs");
const Logger = require("./util/Logger");

/**
 * The main entry point for Sosamba
 * @prop {Logger} log The client log
 * @prop {Collection<Command>} commands The commands that have been loaded by Sosamba
 * @prop {Collection<Event>} events The events that have been loaded by Sosamba
 */
class SosambaClient extends Client {
    /**
     * The client constructor, accepts same parameters as Eris' one.
     */
    constructor(token, options) {
        super(token, options);
        this.log = new Logger({
            stdout: [process.stdout, ...options.log.stdout],
            stderr: [process.stderr, ...options.log.stderr],
            level: options.log.level ? options.log.level : undefined,
            name: "SosambaClient"
        })
        this.commands = new Collection(null);
        this.events = new Collection(Event);
    }

    /**
     * A wrapper method that loads commands and events.
     */
    async connect() {
        await this.loadEvents();
        await this.loadCommands();
        //super.connect();
    }

    async loadEvents(path = `${process.cwd()}/events`) {
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
            const fullPath = `${path}/${d.name}`;
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
                    this.log.error(`The event ${evtClass.constructor.name} at ${fullPath} uses the same event name ${evtClass.evtName} and the class name that has been first loaded at ${a.path}/${a.file}. In order to solve this, please use a different class name.`);
                    evtClass.unmount();
                    return;
                }
                this.log.info(`The event ${evtClass.constructor.name} at ${fullPath} is loaded.`)
            }
        }));
    }

    async loadCommands(path = `${process.cwd()}/commands`) {
        let commands;
        try {
            commands = await promises.readdir(path, {
                withFileTypes: true
            })
        } catch {
            await promises.mkdir(path);
            commands = [];
        }
        return Promise.all(commands.map(async d => {
            const fullPath = `${path}/${d.name}`;
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
                // For now a check for object
                // TODO: Change this to Command when the Command class is done.
                if (!(f instanceof Object)) {
                    this.log.error(`The command located at ${fullPath} is not an instance of the Command class, ignoring.`);
                    return;
                }
                //f.mount();
                this.log.info(`The command located at ${fullPath} is loaded.`)
            }
        }));
    }
}

module.exports = SosambaClient;