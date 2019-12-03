"use strict";
const {promises} = require("fs");
class I18N {
    constructor(bot) {
        this.bot = bot;
        this.languages = {};
    }
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