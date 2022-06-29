"use strict";
const { Client, Command } = require("sosamba");

const client = new Client("NeveR.goNnA_gIve.You_Up_NevEr_GonNa_LeT_You_dOwn", {
    prefix: "test!",
    
    // Disable debug event logging
    // If not set, setting NODE_ENV=production will disable it
    log: {
        level: ["info", "warn", "error", "log"],
    },
});

// The client is an Eris instance: you can listen to events using it
// However, you will be missing a log instance and other goodies :/
client.on("ready", () => {
    // eslint-disable-next-line no-console
    console.info("I'm connected!");
});

// You can even add commands manually if you'd like to:
// The same applies to events:
class TestingCommand extends Command {
    constructor() {
        super(client, undefined, undefined, {
            name: "hello",
            description: "Says \"hello\".",
        });
    }

    async run(ctx) {
        await ctx.send("hello");
    }
}

client.commands.add(new TestingCommand());

// Connect to Discord - pass `false` as a parameter 
// to make it behave like native Eris.Client#connect()
client.connect();
