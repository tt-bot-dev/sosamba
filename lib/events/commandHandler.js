"use strict";
const { Event } = require("../..");
const { get } = require("../Structures");
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
    async run(msg, prefix) {
        this.log.info(`Treating ${msg.content} as command input`);
        const text = msg.content.slice(prefix.length);
        if (!text) return;
        const [command, ...args] = simpleParse.call({ // Mock the constructed parser
            filterEmptySpaces: false,
        }, text);
        const cmd = this.sosamba.commands.get(command.toLowerCase());
        if (!cmd) return;

        const ctx = get("Context");
        const context = new ctx(this.sosamba, msg);
        const argParser = cmd.argParser;
        let arg = args.join(" ");
        if (argParser) {
            try {
                arg = argParser.parse(arg, context);
            } catch (e) {
                if (e instanceof ParsingError) return;
                else {
                    context.send({
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
            cmd.run(context, arg);
        } catch(e) {
            if (!this.sosamba.emit("sosambaCommandError", e)) {
                context.send({
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