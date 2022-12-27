"use strict";
const InternalCommand = require("../util/InternalCommand");
const Constants = require("../Constants");
const { version } = require("../../package.json");
const { VERSION: erisVersion } = require("@projectdysnomia/dysnomia");

class InfoCommand extends InternalCommand {
    constructor(...args) {
        super(...args, {
            name: "info",
            description: "Gives some information about me and my heart.",
        });
    }

    async run(ctx) {
        await ctx.send({
            embeds: [{
                title: `:wave: Hello there, I'm ${this.sosamba.user.username}!`,
                description: `I'm a bot built on the [Sosamba](https://owo.codes/tt.bot/frameworks/sosamba) framework (v${version}). I'm currently on ${this.sosamba.guilds.size} servers, knowing ${this.sosamba.users.size} users in these servers.`,
                fields: [{
                    name: "Technical information",
                    value: `Sosamba version: ${version}\nDysnomia version: ${erisVersion}\nNode.js version: ${process.versions.node} (v8 v${process.versions.v8})`,
                }],
                color: Constants.Colors.SUCCESS,
            }],
        });
    }
}

module.exports = InfoCommand;
