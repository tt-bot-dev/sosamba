"use strict";
const { Event } = require("../..");
const { STOP_REASONS } = require("../Constants");

class MessageDeleteHandler extends Event {
    constructor(...args) {
        super(...args, {
            name: "messageDeleteBulk",
            once: false
        });
    }

    async run(msg) {
        for (const m of msg) {
            m.dead = true;
        }
        const msgs = msg.filter(m => m._responseMsg);
        for (const m of msgs) {
            m._responseMsg.dead = true;
            if (!msg.find(mm => mm.id === m._responseMsg.id)) {
                await m._responseMsg.delete();
            }
        }
        msg.filter(m => this.sosamba.reactionMenus.has(m.id)).forEach(mm => {
            const m = this.sosamba.reactionMenus.get(mm.id);
            if (m._timer) clearTimeout(m._timer);
            m.stopCallback(STOP_REASONS.MESSAGE_DELETE);
            this.sosamba.reactionMenus.remove(m);
        });
    }
}

module.exports = MessageDeleteHandler;