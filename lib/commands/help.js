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
            if (!this.sosamba.commands.has(command)) {
                ctx.send({
                    embed: {
                        color: Constants.Colors.ERROR,
                        title: `:question: ${command} does not exist`,
                        description: `If you would like to check other commands I have, run \`${ctx.prefixes[0]}help\`.`
                    }
                });
            } else {
                const cmd = this.sosamba.commands.get(command);
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
                    value: syntax
                });
                ctx.send({
                    embed: {
                        color: Constants.Colors.SUCCESS,
                        title: `:question: Help for ${command}`,
                        description: cmd.description || "No description provided.",
                        fields
                    }
                });
            }
        } else {
            let commandString = "";
            for (const cmd of [...this.sosamba.commands.values()]
                .sort((a, b) => a.name.localeCompare(b.name))) {
                if (!await cmd.permissionCheck(ctx) || !cmd.displayInHelp) continue;
                const usage = cmd.argParser && cmd.argParser.provideUsageString(false) || (cmd.args || "");
                commandString += `${cmd.name} ${usage}`.trim();
                commandString += "\n";
            }

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