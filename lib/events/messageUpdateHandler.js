"use strict";
const { Event } = require("../..");
const Context = require("../structures/Context");

class MessageUpdateHandler extends Event {
    constructor(...args) {
        super(...args, {
            name: "messageUpdate",
            once: false,
        });
    }

    prerequisites(msg, oldMsg) {
        return oldMsg && msg.content !== oldMsg.content &&
            msg.author &&
            !msg.author.bot &&
            msg.guildID &&
            this.sosamba.hasBotPermission(msg.channel, "sendMessages");
    }

    async run(msg) {
        const context = new Context(this.sosamba, msg);

        for (const ml of this.sosamba.messageListeners.values()) {
            if (ml.allowEdit && await ml.prerequisites(context)) ml.run(context);
        }
    }
}

module.exports = MessageUpdateHandler;
