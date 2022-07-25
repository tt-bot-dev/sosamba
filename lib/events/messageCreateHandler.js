"use strict";
const { Event } = require("../..");
const Context = require("../structures/Context");

class MessageCreateHandler extends Event {
    constructor(...args) {
        super(...args, {
            name: "messageCreate",
            once: false,
        });
    }

    prerequisites(msg) {
        return msg.author && !msg.author.bot &&
            msg.guildID && this.sosamba.hasBotPermission(msg.channel, "sendMessages");
    }

    async run(msg) {
        const context = new Context(this.sosamba, msg);
        
        for (const ml of this.sosamba.messageListeners.values()) {
            if (await ml.prerequisites(context)) ml.run(context);
        }
    }
}

module.exports = MessageCreateHandler;
