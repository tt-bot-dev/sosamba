"use strict";
const { Event } = require("../..");
const arrayStartsWith = require("../util/arrayStartsWith");

class MessageCreateHandler extends Event {
    constructor(...args) {
        super(...args, {
            name: "messageCreate",
            once: false
        });
    }
    prerequisites(msg) {
        return msg.author && !msg.author.bot &&
         msg.channel.guild && arrayStartsWith(msg.content, this.sosamba.getPrefix(msg))
         && this.sosamba.hasBotPermission(msg.channel, "sendMessages");
    }
    run(msg) {
        this.sosamba.emit("toinvokeCommand", msg, arrayStartsWith(msg.content, this.sosamba.getPrefix(msg), true));
    }
}

module.exports = MessageCreateHandler;