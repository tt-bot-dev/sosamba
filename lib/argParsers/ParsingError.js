"use strict";
/**
 * A special error type that indicates a parsing error
 * @extends {Error}
 */
class ParsingError extends Error {
    /**
     * Construct a ParsingError
     * @param {string} [message] The error message
     * @param {boolean} [ignore=false] If the argument parsers shall send a message about what happened or not
     */
    constructor(message, ignore) {
        super(message);
        this.name = "ParsingError";
        this.ignore = !!ignore;
    }
}

module.exports = ParsingError;