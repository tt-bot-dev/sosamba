"use strict";

class Context {
    constructor(sosamba, msg) {
        this.sosamba = sosamba;
        this.guild = msg.channel.guild;
        this.channel = msg.channel;
        this.author = msg.author;
        this.member = msg.member;
        this.message = msg;
        this.msg = msg;
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

    async waitForMessage(...args) {
        return this.sosamba.messageAwaiter.waitForMessage(this, ...args);
    }

    async waitForAnyMessage(...args) {
        return this.sosamba.messageAwaiter.waitForAnyMessage(...args);
    }

    async askYesNo(...args) {
        return this.sosamba.messageAwaiter.askYesNo(this, ...args);
    }
}
module.exports = Context;
