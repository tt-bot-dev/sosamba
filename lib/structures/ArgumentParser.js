"use strict";
/**
 * A base class for argument parsers;
 * every argument parser must implement
 * this class.
 */
class ArgumentParser {
    /**
     * Constructs an argument parser
     * @param {SosambaClient} sosamba The client
     */
    constructor(sosamba) {
        this.sosamba = sosamba;
    }

    /**
     * Parses the content; must be implemented by member classes.
     * @param {string} content The argument string that should be parsed
     * @param {Context} ctx In case if needed, the command context
     * @returns {any} The value returned by the parser differs in all classes.
     */
    parse(content, ctx) { // eslint-disable-line no-unused-vars
        throw new Error("Must be implemented by member classes");
    }
}

module.exports = ArgumentParser;