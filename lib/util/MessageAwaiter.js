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
         * @type {Map<Sosamba.Context, object>}
         */
        this.listeners = new Map();
    }

    prerequisites(ctx) {
        return this.listeners.has(`${ctx.channel.id}:${ctx.author.id}`);
    }


    async run(ctx) {
        const d = this.listeners.get(`${ctx.channel.id}:${ctx.author.id}`);
        if (d.filter && !await d.filter(ctx)) return;
        if (d.timeout) clearTimeout(d.timeout);
        d.rs(ctx);
        this.listeners.delete(`${ctx.channel.id}:${ctx.author.id}`);
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
                this.listeners.delete({
                    channel: ctx.author.id,
                    author: ctx.author.id
                });
            }, timeout);
            this.listeners.set(`${ctx.channel.id}:${ctx.author.id}`, {
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
        const m = this.waitForMessage(ctx, c => /^y(?:es)?|no?$/.test(c), 1e4);
        const resp = /^no?$/.test(m.msg.content);
        if (!returnMessage) return resp;
        else return {
            response: resp,
            context: m
        };
    }
}

module.exports = MessageAwaiter;