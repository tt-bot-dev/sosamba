"use strict";
const {promises} = require("fs");
class I18N {
    constructor(bot) {
        this.bot = bot;
        this.languages = {};
    }
    async addLanguages(path = `${__dirname}/../languages`) {
        const langDir = await promises.readdir(path, {
            withFileTypes: true
        });

        for (const langFile of langDir) {
            if (!langFile.isFile()) continue;
            if (!langFile.name.toLowerCase().endsWith(".js")) continue;
            const translation = require(`${path}/${langFile.name}`);
            const langName = langFile.name.replace(/\.js$/, "");
            if (!Object.prototype.hasOwnProperty.call(this.languages, langName)) this.languages[langName] = {};
            Object.assign(this.languages[langName], translation(this.bot));
        }
    }
    async getTranslation(term, lang, ...args) {
        const language = this.languages[lang];
        if (!language) return term;
        const translation = language[term.toUpperCase()];
        if (!translation && language.fallbackLanguage) {
            return await this.getTranslation(term, language.fallbackLanguage, ...args);
        } else if (!translation) return term;
        if (typeof translation === "string") return translation;
        return await translation(...args);
    }
}

module.exports = I18N;