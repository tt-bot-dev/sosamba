"use strict";
const LocaleFormatter = require("../structures/LocaleFormatter");

class DefaultLocaleFormatter extends LocaleFormatter {
    async formatTranslation(term, ...args) {
        if (typeof term === "string") return term;
        else return await term(...args);
    }
}

module.exports = DefaultLocaleFormatter;
