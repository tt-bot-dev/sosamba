"use strict";
const { Event } = require("../..");

class SosambaReadyEvent extends Event {
    constructor(...args) {
        super(...args, {
            name: "ready",
            once: false,
        });
    }

    async run() {
        if (!this.sosamba._isReady) {
            await this.sosamba._registerSlashCommands();
            
            this.sosamba.readyTime = Date.now();
            this.sosamba._isReady = true;
        }
    }
}

module.exports = SosambaReadyEvent;
