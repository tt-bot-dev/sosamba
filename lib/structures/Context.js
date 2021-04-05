"use strict";

const ReactionMenu = require("./ReactionMenu");
const { STOP_REASONS } = require("../Constants");
class Context {
    constructor(sosamba, msg) {
        this.sosamba = sosamba;
        this.guild = msg.channel.guild;
        this.channel = msg.channel;
        this.author = msg.author;
        this.member = msg.member;
        this.message = msg;
        this.msg = msg;

        this.prefixes = [];
    }

    async send(content, file, doSet = true) {
        // Sorry for commiting a sin, but we create a new context each time, thus a context isn't the most permanent method of storing anything
        if (this.message._responseMsg && !this.message._dead && !this.message._responseMsg._dead) {
            if (file) {
                // Unfortunately
                await this.message._responseMsg.delete();
                const p = this.channel.createMessage(content, file);
                if (doSet) return this.message._responseMsg = await p;
                else return await p;
            } else {
                return await this.message._responseMsg.edit(content);
            }
        } else {
            const p = this.channel.createMessage(content, file);
            if (doSet) return this.message._responseMsg = await p;
            else return await p;
        }
    }

    async registerReactionMenu(menu) {
        if (!(menu instanceof ReactionMenu)) throw new Error("The reaction menu is not an instance of the ReactionMenu class");
        try {
            await menu.prepareEmoji();
        } catch(e) {
            menu.stopCallback(STOP_REASONS.CANNOT_ADD_REACTIONS);
            return;
        }
        this.sosamba.reactionMenus.add(menu);
        if (menu.timeout) menu._timer = setTimeout(() => {
            menu.stopCallback(STOP_REASONS.TIMEOUT);
            this.sosamba.reactionMenus.remove(menu);
        }, menu.timeout);
    }

    async waitForMessage(...args) {
        return this.sosamba.messageAwaiter.waitForMessage(this, ...args);
    }

    async waitForAnyMessage(...args) {
        return this.sosamba.messageAwaiter.waitForAnyMessage(...args);
    }

    async askYesNo(...args) {
        return this.sosamba.messageAwaiter.askYesNo(this, ...args);
    }

    get userLanguage() {
        return Promise.resolve("en");
    }

    async t(name, ...args) {
        const lang = await this.userLanguage;
        return await this.sosamba.i18n.getTranslation(name, lang, ...args);
    }
}
module.exports = Context;
