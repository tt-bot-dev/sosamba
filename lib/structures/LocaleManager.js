"use strict";
const { Collection } = require("eris");
const Locale = require("./Locale");
const lookForFiles = require("../util/lookForFiles");

const { promises } = require("fs");
const { join } = require("path");

class LocaleManager {
    constructor(sosamba) {
        this.sosamba = sosamba;
        this.locales = new Collection(Locale);
    }

    async translate(language, term, ...args) {
        let lang = this.locales.get(language);
        if (!lang) {
            if (this.sosamba.options.defaultLocale && this.locales.has(this.sosamba.options.defaultLocale)) {
                lang = this.locales.get(this.sosamba.options.defaultLocale);
            } else {
                throw new Error("Invalid locale");
            }
        }

        return lang.formatText(term, ...args);
    }

    async findLanguages(path = join(process.cwd(), "locales")) {
        return await lookForFiles(path, this.locales, this.sosamba, Locale);
    }

    async findJSONLanguages(path, cls) {
        if (!(cls.prototype instanceof Locale)) throw new Error("The base locale must be a subclass of Locale");
        let items;
        try {
            items = await promises.readdir(path, {
                withFileTypes: true,
            });
        } catch {
            await promises.mkdir(path);
            items = [];
        }

        return Promise.all(items.map(async d => {
            const fullPath = join(path, d.name);
            if (d.isDirectory()) {
                this.sosamba.log.debug(`Hit a directory at ${fullPath}`);
                await this.findJSONLanguages(fullPath, cls);
            } else {
                if (!d.name.endsWith(".json")) return;

                const file = await promises.readFile(fullPath);

                let localeData;
                try {
                    localeData = JSON.parse(file);
                } catch (e) {
                    return e;
                }

                const itemClass = new cls(this.sosamba, d.name, path);
                itemClass.terms = localeData; 
                itemClass.mount();

                const addedClass = this.locales.add(itemClass);
                if (itemClass !== addedClass) {
                    this.sosamba.log.error(`The locale class ${itemClass.constructor.name} at ${fullPath} uses the same locale name ${itemClass.id} and the class name that has been first loaded at ${join(addedClass.path, addedClass.file)}. In order to solve this, please use a different locale name.`);
                    itemClass.unmount();
                    return new Error("The locale conflicts with another locale.");
                }

                this.sosamba.log.debug(`The locale located at ${fullPath} is loaded.`);
            }
        }));
    }
}

module.exports = LocaleManager;
