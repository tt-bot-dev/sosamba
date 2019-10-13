"use strict";
const MessageListener = require("../structures/MessageListener");

/**
 * Helps awaiting messages
 * @memberof Sosamba
 * @private
 * @extends Sosamba.MessageListener
 */
class MessageAwaiter extends MessageListener {
    constructor(...args) {
        super(...args);

        /**
         * A map for the listeners
         * @type {Map<string, object>}
         */
        this.listeners = new Map();

        /**
         * A map for the {@link Sosamba.MessageAwaiter#waitForAnyMessage} listeners
         * If a message is awaited for the responder, these take priority.
         * @type {Map<string, object>}
         */
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

    /**
     * Waits for a message
     * @param {Sosamba.Context} ctx The context
     * @param {Function} filter The filter for the messages
     * @param {number} timeout After how much time the request times out
     * @returns {Promise<Sosamba.Context>} The context of the message
     */
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
                timeout: t
            });
        });
    }

    /**
     * Waits for a message regardless of the author
     * @param {string} channelID The channel ID to await the message from
     * @param {Function} filter The filter for the messages
     * @param {number} timeout After how much time the request times out
     * @returns {Promise<Sosamba.Context>} The context of the message
     */
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
                timeout: t
            });
        });
    }

    /**
     * The returns from the askYesNo method
     * @typedef {object} YesNoReturn
     * @memberof Sosamba.MessageAwaiter
     * @prop {boolean} response The response
     * @prop {Sosamba.Context} context The new message context
     */

    /**
     * A helper method to filter out question responses
     * @param {Sosamba.Context} ctx The context
     * @param {boolean} [returnMessage=false] If to return the response context as well
     * @returns {boolean|YesNoReturn} If returnMessage is false, returns a boolean.
     */
    async askYesNo(ctx, returnMessage = false) {
        try {
            const m = await this.waitForMessage(ctx, c => /^y(?:es)?|no?$/.test(c.msg.content), 10000);
            const resp = /^no?$/.test(m.msg.content);
            return returnMessage ? {
                response: !resp,
                context: m
            } : !resp;
        } catch {
            return returnMessage ? {
                response: false,
                context: null
            } : false;
        }
    }
}

module.exports = MessageAwaiter;