"use strict";
const {promises} = require("fs");
/**
 * Internationalization part of Sosamba
 * @memberof Sosamba
 */
class I18N {
    constructor(bot) {
        this.bot = bot;
        this.languages = {};
    }

    /**
     * Adds languages to the class
     * @param {string} path Path to the language files
     * @returns {Promise}
     */
    async addLanguages(path = `${__dirname}/../languages`) {
        const d = await promises.readdir(path, {
            withFileTypes: true
        });

        for (const de of d) {
            if (!de.isFile()) continue;
            if (!de.name.toLowerCase().endsWith(".js")) continue;
            const translation = require(`${path}/${de.name}`);
            const ln = de.name.replace(/\.js$/, "");
            if (!this.languages.hasOwnProperty(ln)) this.languages[ln] = {};
            Object.assign(this.languages[ln], translation(this.bot));
        }
    }

    /**
     * Gets a translation
     * @param {string} term Term name to translate (should be uppercase)
     * @param {string} lang The language of the end user
     * @param {...any} args Arguments for the function, if any
     * @returns {Promise<string>}
     */
    async getTranslation(term, lang, ...args) {
        const l = this.languages[lang];
        if (!l) return term;
        const tr = l[term.toUpperCase()];
        if (!tr && l.fallbackLanguage) {
            return await this.getTranslation(term, l.fallbackLanguage, ...args);
        } else if (!tr) return term;
        if (typeof tr === "string") return tr;
        return await tr(...args);
    }
}

module.exports = I18N;