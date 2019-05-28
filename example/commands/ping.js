"use strict";
const { Command } = require("../../lib/sosamba");
class PingCommand extends Command {
    constructor(...args) {
        super(...args, {
            name: "ping"
        });
    }

    // eslint-disable-next-line no-unused-vars
    async run(ctx, args) {
        await ctx.send("Ping!").then(m => m.edit(`Pong! ${m.timestamp - ctx.message.timestamp}ms`));
    }
}

module.exports = PingCommand;