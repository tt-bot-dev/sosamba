"use strict";
const MessageListener = require("../structures/MessageListener");

class MessageAwaiter extends MessageListener {
    constructor(...args) {
        super(...args);
        this.listeners = new Map();
        this.anyListeners = new Map();
    }

    prerequisites(ctx) {
        return this.anyListeners.has(ctx.channel.id) || this.listeners.has(`${ctx.channel.id}:${ctx.author.id}`);
    }


    async run(ctx) {
        let isAny = false, d;
        if (this.anyListeners.has(ctx.channel.id)) {
            isAny = true;
            d = this.anyListeners.get(ctx.channel.id);
        } else d = this.listeners.get(`${ctx.channel.id}:${ctx.author.id}`);
        if (d.filter && !await d.filter(ctx)) return;
        if (d.timeout) clearTimeout(d.timeout);
        d.rs(ctx);
        this[isAny ? "anyListeners" : "listeners"]
            .delete(isAny ? ctx.channel.id : `${ctx.channel.id}:${ctx.author.id}`);
    }

    waitForMessage(ctx, filter, timeout) {
        return new Promise((rs, rj) => {
            if (this.listeners.has(`${ctx.channel.id}:${ctx.author.id}`)) rj(new Error("A message is already awaited for this user"));
            let t;
            if (timeout) t = setTimeout(() => {
                if (!this.listeners.has(`${ctx.channel.id}:${ctx.author.id}`)) return;
                rj("Timed out");
                this.listeners.delete(`${ctx.channel.id}:${ctx.author.id}`);
            }, timeout);
            this.listeners.set(`${ctx.channel.id}:${ctx.author.id}`, {
                filter,
                rs,
                timeout: t,
            });
        });
    }

    waitForAnyMessage(channel, filter, timeout) {
        return new Promise((rs, rj) => {
            if (this.anyListeners.has(channel)) rj(new Error("A message is already awaited for this channel"));
            let t;
            if (timeout) t = setTimeout(() => {
                if (!this.anyListeners.has(channel)) return;
                rj("Timed out");
                this.anyListeners.delete(channel);
            }, timeout);
            this.anyListeners.set(channel, {
                filter,
                rs,
                timeout: t,
            });
        });
    }

    async askYesNo(ctx, returnMessage = false) {
        try {
            const m = await this.waitForMessage(ctx, c => /^y(?:es)?|no?$/i.test(c.msg.content), 10000);
            const resp = /^no?$/i.test(m.msg.content);
            return returnMessage ? {
                response: !resp,
                context: m,
            } : !resp;
        } catch {
            return returnMessage ? {
                response: false,
                context: null,
            } : false;
        }
    }
}

module.exports = MessageAwaiter;
