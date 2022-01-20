"use strict";
const Base = require("./SosambaBase");
class Command extends Base {
    constructor(sosamba, fileName, filePath, { name, args, description, defaultPermission, registerIn, guildOnly }) {
        super(sosamba, fileName, filePath);
        registerIn ??= sosamba.options.registerSlashCommandsIn;
        this.name = name.toLowerCase();

        // This will be replaced by Discord's ID at runtime
        this.id = registerIn ? `${registerIn}:${this.name}` : this.name;
        this.args = args;
        
        this.description = description;
        this.defaultPermission = defaultPermission;
        this.registerIn = registerIn;
        this.guildOnly = guildOnly;
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
