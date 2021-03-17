"use strict";
const { Event } = require("../..");
const { STOP_REASONS } = require("../Constants");

class MessageDeleteHandler extends Event {
    constructor(...args) {
        super(...args, {
            name: "messageDelete",
            once: false
        });
    }
    
    // A simple check that the message is cached
    prerequisites(msg) {
        return !!msg.content;
    }

    async run(msg) {
        msg._dead = true;
        if (msg._responseMsg) {
            msg._responseMsg._dead = true;
            try {
                await msg._responseMsg.delete();
            } catch {
                console.debug("WTF: couldn't delete response message");
            }

        }

        if (this.sosamba.reactionMenus.has(msg.id)) {
            const m = this.sosamba.reactionMenus.get(msg.id);
            if (m._timer) clearTimeout(m._timer);
            m.stopCallback(STOP_REASONS.MESSAGE_DELETE);
            this.sosamba.reactionMenus.remove(m);
        }
    }
}

module.exports = MessageDeleteHandler;