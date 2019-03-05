/**
 * A special error type that indicates a parsing error
 */
class ParsingError extends Error {
    constructor(...args) {
        super(...args);
        this.name = "ParsingError";
    }
};

module.exports = ParsingError;