"use strict";
/**
 * A base class for argument parsers;
 * every argument parser must implement
 * this class.
 * @memberof Sosamba
 */
class ArgumentParser {
    /**
     * Constructs an argument parser
     * @param {Sosamba.Client} sosamba The client
     */
    constructor(sosamba) {
        this.sosamba = sosamba;
    }

    /**
     * Parses the content; must be implemented by member classes.
     * @param {string} content The argument string that should be parsed
     * @param {Sosamba.Context} ctx In case if needed, the command context
     * @returns {any} The value returned by the parser differs in all classes.
     */
    parse(content, ctx) { // eslint-disable-line no-unused-vars
        throw new Error("Must be implemented by member classes");
    }

    /**
     * Provides the usage string; should be implemented by member classes if the bot decides to use the default help command.
     * Else, the default help command will use command's argument string.
     * @param {boolean} detailed Whether we want detailed help description or not.
     */
    provideUsageString(detailed = false) { // eslint-disable-line no-unused-vars
        return null;
    }
}

module.exports = ArgumentParser;