"use strict";
// An example event module using the Sosamba framework
const { Event } = require("sosamba");

class ShardReadyEvent extends Event {
    constructor(...args) {
        super(...args, {
            name: "shardReady",
        });
    }

    // You can include a check if this event will run or not
    // The arguments are as they come from Eris
    prerequisites(id) {
        return id < 1;
    }

    async run(id) {
        this.log.info(`Shard ${id} is ready.`);
    }
}

module.exports = ShardReadyEvent;
