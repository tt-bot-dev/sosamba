"use strict";
class LocaleFormatter {
    constructor(locale) {
        this.locale = locale;
    }

    // eslint-disable-next-line no-unused-vars
    async formatTranslation(term, ...args) {
        throw new Error("Must be implemented by member classes");
    }
}

module.exports = LocaleFormatter;