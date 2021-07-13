"use strict";
const Command = require("../util/InternalCommand");
const SimpleArgumentParser = require("../argParsers/SimpleArgumentParser");
const Constants = require("../Constants");

class HelpCommand extends Command {
    constructor(sosamba, ...args) {
        super(sosamba, ...args, {
            name: "help",
            args: "[command:String]",
            argParser: new SimpleArgumentParser(sosamba, {
                filterEmptyArguments: true,
                separator: " "
            }),
            displayInHelp: false
        });
    }

    async run(ctx, [command]) {
        if (command) {
            const cmd = this.sosamba.commands.get(command);
            if (!cmd) {
                ctx.send({
                    embed: {
                        color: Constants.Colors.ERROR,
                        title: `:question: Command \`${command}\` does not exist`,
                        description: `If you would like to check other commands I have, run \`${ctx.prefixes[0]}help\`.`
                    }
                });
            } else {
                const usage = cmd.argParser && cmd.argParser.provideUsageString(true) || (cmd.args || "No usage provided");
                const syntax = cmd.argParser && cmd.argParser.provideUsageString(false) || (cmd.args || "No usage provided");
                const fields = [
                    {
                        name: "Usage",
                        value: usage
                    }
                ];
                if (syntax !== usage) fields.unshift({
                    name: "Syntax",
                    value: `\`${ctx.prefixes[0]}${cmd.name} ${syntax}\``
                });
                ctx.send({
                    embed: {
                        color: Constants.Colors.SUCCESS,
                        title: `:question: Help for \`${command}\``,
                        description: cmd.description || "No description provided.",
                        fields
                    }
                });
            }
        } else {
            const commandString = (await Promise.all(
                this.sosamba.commands
                    .filter(cmd => cmd.displayInHelp)
                    .sort((a, b) => a.name.localeCompare(b.name))
                    .map(async cmd => {
                        if (!await cmd.permissionCheck(ctx)) return "";
                        const usage = cmd.argParser && cmd.argParser.provideUsageString(false) || (cmd.args || "");
                        return `${ctx.prefixes[0]}${cmd.name} ${usage}`.trim();
                    })
            )).filter(Boolean).join("\n");
                

            ctx.send({
                embed: {
                    color: Constants.Colors.SUCCESS,
                    title: ":question: Here are the commands you can use",
                    description: `\`\`\`\n${commandString}\n\`\`\``,
                    footer: {
                        text: `Want to know something more about a command? Type ${ctx.prefixes[0]}help <command>`
                    }
                }
            });
        }
    }
}

module.exports = HelpCommand;