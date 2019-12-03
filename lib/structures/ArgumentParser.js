"use strict";
class ArgumentParser {
    constructor(sosamba) {
        this.sosamba = sosamba;
    }

    parse(content, ctx) { // eslint-disable-line no-unused-vars
        throw new Error("Must be implemented by member classes");
    }

    provideUsageString(detailed = false) { // eslint-disable-line no-unused-vars
        return null;
    }
}

module.exports = ArgumentParser;