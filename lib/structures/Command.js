"use strict";
const Base = require("./SosambaBase");
const ArgumentParser = require("./ArgumentParser");
class Command extends Base {
    constructor(sosamba, fileName, filePath, {name, args, argParser, displayInHelp, description}) {
        super(sosamba, fileName, filePath);
        this.name = name.toLowerCase();
        this.id = this.name;
        this.args = args;
        this.argParser = null;
        if (argParser && (argParser instanceof ArgumentParser)) this.argParser = argParser;
        this.displayInHelp = null;

        if (displayInHelp == null) {
            this.displayInHelp = true;
        } else {
            this.displayInHelp = displayInHelp;
        }
        this.description = description;
    }

    permissionCheck(ctx) { // eslint-disable-line no-unused-vars
        return true;
    }

    run(ctx, args) { // eslint-disable-line no-unused-vars
        throw new Error("Must be implemented by member classes.");
    }

    mount() {
        /**
         * Do nothing here as the command creators might
         * want to implement something special for their
         * command and we don't want to throw an error
         * here.
         */
    }

    /**
     * Unmounts a command. Use if you want to clean up.
     * Keep in mind, that any application overriding this
     * method MUST call `super.unmount()` in order to ensure
     * proper removal.
     */
    unmount() {
        this.log.debug(`The command ${this.constructor.name} is getting unloaded.`);
        this.sosamba.commands.remove(this);
    }
}

module.exports = Command;