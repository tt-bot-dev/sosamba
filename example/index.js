"use strict";
const {Client} = require("../index");
const { createWriteStream } = require("fs");
const bot = new Client("TOKEN", {
    log: {
        stdout: [createWriteStream("./log.txt", {
            flags: "a"
        })],
        stderr: [createWriteStream("./log.txt", {
            flags: "a"
        })]
    },
    prefix: "!" // This is not a recommended practice
});
bot.connect();