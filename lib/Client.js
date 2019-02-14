const { Client } = require("eris");
const Event = require("./event/Event");
const { promises } = require("fs");
const Logger = require("./util/Logger");

/**
 * The main entry point for Sosamba
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
    }

    /**
     * A wrapper method that loads commands and events.
     */
    async connect() {
        super.connect();
    }

    async loadCommands(path = `${process.cwd()}/commands`) {
        const commands = await promises.readdir(path, {
            withFileTypes: true
        })
        commands.forEach(async d => {
            if (d.isDirectory()) {
                this.log.debug(d.name)
                //await this.loadCommands(d)
            } else {
                this.log.debug("FILE", d.name)
            }
        })
    }
}

module.exports = SosambaClient;