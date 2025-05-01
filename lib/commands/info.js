"use strict";
const InternalCommand = require("../util/InternalCommand");
const Constants = require("../Constants");
const { version } = require("../../package.json");
const { VERSION: erisVersion, Constants: { MessageFlags, ComponentTypes } } = require("@projectdysnomia/dysnomia");

class InfoCommand extends InternalCommand {
    constructor(...args) {
        super(...args, {
            name: "info",
            description: "Gives some information about me and my heart.",
        });
    }

    async run(ctx) {
        await ctx.send({
            flags: MessageFlags.IS_COMPONENTS_V2,
            components: [
                {
                    type: ComponentTypes.CONTAINER,
                    components: [
                        {
                            type: ComponentTypes.TEXT_DISPLAY,
                            content: `# :wave: Hello there, I'm ${this.sosamba.user.username}!` +
                                `\nI'm a bot built on the [Sosamba](https://owo.codes/tt.bot/frameworks/sosamba) framework (v${version}). I'm currently on ${this.sosamba.guilds.size} servers, knowing ${this.sosamba.users.size} users in these servers.` +
                                "\n## Technical information" +
                                `\nSosamba version: ${version}` +
                                `\nDysnomia version: ${erisVersion}` +
                                `\nNode.js version: ${process.versions.node} (V8 v${process.versions.v8})`,
                        },
                    ],
                    accent_color: Constants.Colors.SUCCESS,
                },
            ],
        });
    }
}

module.exports = InfoCommand;
