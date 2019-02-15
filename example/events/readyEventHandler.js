const { Event } = require("../../lib/sosamba");

/**
 * A handler allowing to tell you if the bot is ready to go and handle incoming commands
 */
class ReadyEvent extends Event {
    constructor(...args) {
        super(...args, {
            name: "ready",
            once: false
        });
    }
    run() {
        this.log.info("I'm ready!");
        this.sosamba.editStatus("online", {
            name: `A testing Sosamba prototype | ${this.sosamba.options.prefix}`,
            type: 0
        })
    }
}

module.exports = ReadyEvent;