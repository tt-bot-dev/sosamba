"use strict";
class ParsingError extends Error {
    constructor(message, ignore) {
        super(message);
        this.name = "ParsingError";
        this.ignore = !!ignore;
    }
}

module.exports = ParsingError;