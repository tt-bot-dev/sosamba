"use strict";
const { Event } = require("../..");
const arrayStartsWith = require("../util/arrayStartsWith");
const { get } = require("../Structures");

class MessageUpdateHandler extends Event {
    constructor(...args) {
        super(...args, {
            name: "messageUpdate",
            once: false
        });
    }
    prerequisites(msg, oldMsg) {
        return oldMsg &&
            msg.author &&
            !msg.author.bot &&
            msg.content !== oldMsg.content &&
            this.sosamba.hasBotPermission(msg.channel, "sendMessages") &&
            msg.channel.guild
    }
    async run(msg) {
        const ctx = get("Context");
        const context = new ctx(this.sosamba, msg);
        const p = await this.sosamba.getPrefix(msg);
        if (await arrayStartsWith(msg.content, p)) this.sosamba.emit("toinvokeCommand", context, arrayStartsWith(msg.content, p, true));
        for (const ml of this.sosamba.messageListeners.values()) {
            if (ml.allowEdit && await ml.prerequisites(context)) ml.run(context);
        }
    }
}

module.exports = MessageUpdateHandler;