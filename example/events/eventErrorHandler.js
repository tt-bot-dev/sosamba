"use strict";
const { Event } = require("../../lib/sosamba");

/**
 * Handles event errors, including internal event handler ones
 * This handler just logs the error
 */
class SosambaEventErrorEvent extends Event {
    constructor(...args) {
        super(...args, {
            name: "sosambaEventError",
            once: false
        });
    }
    run(err) {
        this.log.error(err);
    }
}

module.exports = SosambaEventErrorEvent;