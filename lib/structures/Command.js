"use strict";
const Base = require("./SosambaBase");
const ArgumentParser = require("./ArgumentParser");

/**
 * Represents a command
 * @extends Sosamba.SosambaBase
 * @memberof Sosamba
 * @example
 * const { Command } = require("sosamba");
 * class TestCommand extends Command {
 *     constructor(sosamba, ...args) {
 *         super(...args, {
 *             name: "test",
 *             args: "<string>",
 *             argParser: null
 *         })
 *     }
 *
 *     async run(ctx, args) {
 *         await ctx.send("Hello there!");
 *     }
 * }
 * module.exports = TestCommand;
 */
class Command extends Base {
    /**
     * @typedef {object} CommandOptions
     * @memberof Sosamba.Command
     * @property {string} name The command name
     * @property {string} args The argument string; it is not parsed.
     * @property {ArgumentParser} [argParser] The argument parser.
     */

    /**
     * Constructs a command
     * @param {Sosamba.Client} sosamba The client
     * @param {string} fileName The file name
     * @param {string} filePath The file path
     * @param {CommandOptions} options The command options
     */
    constructor(sosamba, fileName, filePath, {name, args, argParser}) {
        super(sosamba, fileName, filePath);
        /**
         * The command name, also used as an ID
         * @type {string}
         */
        this.name = name.toLowerCase();

        /**
         * The command ID, that is also the name of the command
         * @type {string}
         */
        this.id = this.name;

        /**
         * The argument string; it is not parsed.
         * @type {string}
         */
        this.args = args;

        /**
         * The argument parser.
         * @type {ArgumentParser}
         */
        this.argParser = null;
        if (argParser && (argParser instanceof ArgumentParser)) this.argParser = argParser;
    }

    /**
     * Run a command
     * @param {Context} ctx The command context
     * @param {any} args The arguments returned by the argument parser
     */
    run(ctx, args) { // eslint-disable-line no-unused-vars
        throw new Error("Must be implemented by member classes.");
    }

    /**
     * Mounts a command. Use if you have something special that you cannot do in the constructor.
     */
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
        this.log.info(`The command ${this.constructor.name} is getting unloaded.`);
        this.sosamba.commands.remove(this);
    }
}

module.exports = Command;