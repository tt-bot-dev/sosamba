"use strict";
const { Event } = require("../..");
const arrayStartsWith = require("../util/arrayStartsWith");

class MessageUpdateHandler extends Event {
    constructor(...args) {
        super(...args, {
            name: "messageUpdate",
            once: false
        });
    }
    prerequisites(msg, oldMsg) {
        return !!oldMsg && !!msg.author && !msg.author.bot && msg.content !== oldMsg.content && arrayStartsWith(msg.content, this.sosamba.getPrefix(msg));
    }
    run(msg) {
        this.sosamba.emit("toinvokeCommand", msg, arrayStartsWith(msg.content, this.sosamba.getPrefix(msg), true));
    }
}

module.exports = MessageUpdateHandler;