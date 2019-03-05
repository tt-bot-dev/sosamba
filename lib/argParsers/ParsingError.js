"use strict";
/**
 * A special error type that indicates a parsing error
 * @extends {Error}
 */
class ParsingError extends Error {
    /**
     * Construct a ParsingError
     * @param {string} [message] The error message
     */
    constructor(...args) {
        super(...args);
        this.name = "ParsingError";
    }
}

module.exports = ParsingError;