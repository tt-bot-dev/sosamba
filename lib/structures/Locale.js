"use strict";
const Base = require("./SosambaBase");
const DefaultLocaleFormatter = require("../util/DefaultLocaleFormatter");

class Locale extends Base {
    constructor(sosamba, fileName, filePath, { name, formatter }) {
        super(sosamba, fileName, filePath);

        this.name = name;
        this.id = this.name;

        this.formatter = formatter || new DefaultLocaleFormatter(sosamba);

        this.terms = {};
    }

    formatText(term, ...args) {
        if (!Object.prototype.hasOwnProperty.call(this.terms, term)) {
            if (typeof this.terms.fallbackLanguage === "string") return this.sosamba.localeManager.translate(this.terms.fallbackLanguage, term, ...args);
            return Promise.resolve(term);
        }
        return this.formatter.formatTranslation(this.terms[term], ...args);
    }

    mount() {}

    unmount() {
        this.sosamba.localeManager.locales.remove(this);
    }
}

module.exports = Locale;
