const Base = require("./SosambaBase");

class Command extends Base {
    constructor(sosamba, fileName, filePath, {name, args, argParser}) {
        super(sosamba, fileName, filePath);
        this.name = this.id = name.toLowerCase();
        this.args = args;
        this.argParser = argParser || null;
    }

    run(ctx, args) {
        throw new Error(`Must be implemented by member classes.`);
    }

    mount() {
        /**
         * Do nothing here as the command creators might
         * want to implement something special for their
         * command and we don't want to throw an error
         * here.
         */
    }

    unmount() {
        this.log.info(`The command ${this.constructor.name} is getting unloaded.`);
        this.sosamba.commands.remove(this.id);
    }
}

module.exports = Command;