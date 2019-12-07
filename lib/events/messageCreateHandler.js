"use strict";
const { Event, Command } = require("../..");
const arrayStartsWith = require("../util/arrayStartsWith");
const { get } = require("../Structures");
// Thank the code reuse gods
const { prototype: { parse: simpleParse } } = require("../argParsers/SimpleArgumentParser");
const ParsingError = require("../argParsers/ParsingError");
const { version } = require("../../package.json");
class MessageCreateHandler extends Event {
    constructor(...args) {
        super(...args, {
            name: "messageCreate",
            once: false
        });
    }

    prerequisites(msg) {
        return msg.author && !msg.author.bot &&
            msg.channel.guild
            && this.sosamba.hasBotPermission(msg.channel, "sendMessages");
    }

    async run(msg) {
        const ctx = get("Context");
        const context = new ctx(this.sosamba, msg);
        const p = await this.sosamba.getPrefix(context);
        context.prefixes = Array.isArray(p) ? p : [p];
        if (arrayStartsWith(msg.content, p)) this.handleCommand(context, arrayStartsWith(msg.content, p, true));
        for (const ml of this.sosamba.messageListeners.values()) {
            if (await ml.prerequisites(context)) ml.run(context);
        }
    }

    async handleCommand(ctx, prefix) {
        this.log.debug(`Treating ${ctx.msg.content} as command input`);
        const text = ctx.msg.content.slice(prefix.length);
        if (!text) return;
        const [command, ...args] = simpleParse.call({
            filterEmptySpaces: false,
        }, text);
        let cmd = this.sosamba.commands.get(command.toLowerCase());
        if (!cmd) {
            if (typeof this.sosamba.options.provideCommand === "function") {
                cmd = await this.sosamba.options.provideCommand(ctx, command);
                if (!(cmd instanceof Command) || !cmd) return;
            };
        }
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
        try {
            if (await cmd.permissionCheck(ctx)) {
                this.log.debug(`Running the command ${command} with arguments`, arg);
                await cmd.run(ctx, arg);
            }
        } catch (e) {
            if (!this.sosamba.emit("commandError", e, ctx)) {
                this.log.error(e);
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

module.exports = MessageCreateHandler;