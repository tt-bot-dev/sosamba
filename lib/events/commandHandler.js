"use strict";
const { Event } = require("../..");
// Thank the code reuse gods
const { prototype: { parse: simpleParse } } = require("../argParsers/SimpleArgumentParser");
const ParsingError = require("../argParsers/ParsingError");
const { version } = require("../../package.json");

class CommandHandler extends Event {
    constructor(...args) {
        super(...args, {
            name: "toinvokeCommand",
            once: false
        });
    }
    async run(ctx, prefix) {
        this.log.info(`Treating ${ctx.msg.content} as command input`);
        const text = ctx.msg.content.slice(prefix.length);
        if (!text) return;
        const [command, ...args] = simpleParse.call({ // Mock the constructed parser
            filterEmptySpaces: false,
        }, text);
        const cmd = this.sosamba.commands.get(command.toLowerCase());
        if (!cmd) return;
        const argParser = cmd.argParser;
        let arg = args.join(" ");
        if (argParser) {
            try {
                arg = await argParser.parse(arg, ctx);
            } catch (e) {
                if (e instanceof ParsingError) return;
                else {
                    ctx.send({
                        embed: {
                            title: ":x: Error parsing your arguments",
                            description: `I am unable to parse the arguments because of a coding error:\n\`\`\`js\n${e.stack}\n\`\`\``,
                            color: 0xFF0000,
                            footer: {
                                text: `Please tell the command developers about this. | Sosamba v${version}`
                            }
                        }

                    }).then(null, () => "");
                    return;
                }
            }
        }
        this.log.debug(`Running the command ${command} with arguments`, arg);
        try {
            if (await cmd.permissionCheck(ctx)) await cmd.run(ctx, arg);
        } catch(e) {
            if (!this.sosamba.emit("sosambaCommandError", e)) {
                ctx.send({
                    embed: {
                        title: ":x: Error running the command",
                        description: `I am unable to run the command because of a coding error:\n\`\`\`js\n${e.stack}\n\`\`\``,
                        color: 0xFF0000,
                        footer: {
                            text: `Please tell the command developers about this. | Sosamba v${version}`
                        }
                    }
                }).then(null, () => "");
            }
        }
    }
}

module.exports = CommandHandler;