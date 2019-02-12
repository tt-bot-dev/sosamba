const { Client } = require("eris");
const Event = require("./event/Event");
const { promises } = require("fs");


/**
 * The main entry point for Sosamba
 */
class SosambaClient extends Client {
    /**
     * The client constructor, accepts same parameters as Eris' one.
     */
    constructor(token, options) {
        super(token, options);
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
                console.log(d.name)
                //await this.loadCommands(d)
            } else {
                console.log("FILE", d.name)
            }
        })
    }
}

module.exports = SosambaClient;