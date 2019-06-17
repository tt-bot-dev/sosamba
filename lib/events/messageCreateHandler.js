"use strict";
const { Event } = require("../..");
const arrayStartsWith = require("../util/arrayStartsWith");
const { get } = require("../Structures");
class MessageCreateHandler extends Event {
    constructor(...args) {
        super(...args, {
            name: "messageCreate",
            once: false
        });
    }

    prerequisites(msg) {
        return msg.author && !msg.author.bot &&
         msg.channel.guild
         && this.sosamba.hasBotPermission(msg.channel, "sendMessages");
    }
    
    async run(msg) {
        const ctx = get("Context");
        const context = new ctx(this.sosamba, msg);
        const p = await this.sosamba.getPrefix(context);
        context.prefixes = Array.isArray(p) ? p : [p];
        if (arrayStartsWith(msg.content, p)) this.sosamba.emit("toinvokeCommand", context, arrayStartsWith(msg.content, p, true));
        for (const ml of this.sosamba.messageListeners.values()) {
            if (await ml.prerequisites(context)) ml.run(context);
        }
    }
}

module.exports = MessageCreateHandler;