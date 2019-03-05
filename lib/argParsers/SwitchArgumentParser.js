const SimpleArgumentParser = require("./SimpleArgumentParser");
const ParsingError = require("./ParsingError");
const primitiveSerializers = require("./switchSerializers/jsPrimitives");
const { version } = require("../../package.json")
const switchSerializers = {
    [String]: primitiveSerializers.string,
    [Boolean]: primitiveSerializers.boolean,
    [Number]: primitiveSerializers.number,
    [BigInt]: primitiveSerializers.number64bit
}

class SwitchArgumentParser extends SimpleArgumentParser {
    constructor(sosamba, args) {
        super(sosamba, {
            allowQuotedString: true,
            separator: " "
        });
        this.args = args;
    }
    
    parse(content, ctx) {
        const parsedContent = super.parse.call(Object.assign({}, this, {
            separator: content.includes("|") ? "|": " "
        }), content);

        let output = {};
        for (let arg of parsedContent) {
            arg = arg.trim();
            const [propName, ...propVal] = arg.split(":");
            if (!this.args.hasOwnProperty(propName)) continue; // There's no need to parse what we don't need
            const argument = this.args[propName];
            const val = propVal.join(" ").trim();
            if (!val) {
                if (!argument.hasOwnProperty("default")) {
                    ctx.send({
                        embed: {
                            title: ":x: Argument required",
                            description: `The argument ${propName} is required.`,
                            color: 0xFF0000,
                            footer: {
                                text: `Sosamba v${version}`
                            }
                        }
                    });
                    throw new ParsingError("Required argument not used");
                }
                else output[propName] = typeof argument.default === "function" ? argument.default(ctx) : argument.default;
            } else {
                if (argument.type) {
                    if (!switchSerializers.hasOwnProperty(argument.type)) {
                        try {
                            output[propName] = argument.type(val, ctx);
                        } catch(err) {
                            if (err instanceof ParsingError) {
                                ctx.send({
                                    embed: {
                                        title: ":x: Error parsing your arguments",
                                        description: `I am unable to parse the argument ${propName}: \`${err.message}\``,
                                        color: 0xFF0000,
                                        footer: {
                                            text: `Please review your arguments and try again. | Sosamba v${version}`
                                        }
                                    }
                                })
                                throw err;
                            } else {
                                ctx.send({
                                    embed: {
                                        title: ":x: Error parsing your arguments",
                                        description: `I am unable to parse the argument ${propName} because of a coding error:\n\`\`\`js\n${err.stack}\n\`\`\``,
                                        color: 0xFF0000,
                                        footer: {
                                            text: `Please tell the command developers about this. | Sosamba v${version}`
                                        }
                                    }
                                })
                                throw new ParsingError(`Cannot parse arguments due to the following error: \n${err.stack}\n`);
                            }
                        }
                    } else {
                        try {
                            output[propName] = switchSerializers[argument.type](val, ctx);
                        } catch(err) {
                            if (err instanceof ParsingError) {
                                ctx.send({
                                    embed: {
                                        title: ":x: Error parsing your arguments",
                                        description: `I am unable to parse the argument ${propName}: \`${err.message}\``,
                                        color: 0xFF0000,
                                        footer: {
                                            text: `Please review your arguments and try again. | Sosamba v${version}`
                                        }
                                    }
                                })
                                throw err;
                            } else {
                                ctx.send({
                                    embed: {
                                        title: ":x: Error parsing your arguments",
                                        description: `I am unable to parse the argument ${propName} because of a coding error:\n\`\`\`js\n${err.stack}\n\`\`\`\n[Report the issue on GitHub](https://github.com/tt-bot-dev/sosamba/issues)`,
                                        color: 0xFF0000,
                                        footer: {
                                            text: `This is an issue with Sosamba's default serializers. Please report this issue on GitHub. | Sosamba v${version}`
                                        }
                                    }
                                })
                                throw new ParsingError(`Cannot parse arguments due to the following error: \n${err.stack}\n`);
                            }
                        }
                    }
                }
            }
        }
        for (const prop of Object.keys(this.args)) {
            if (output.hasOwnProperty(prop)) continue;
            const arg = this.args[prop];
            if (arg.hasOwnProperty("default")) output[prop] = arg.default;
            else {
                ctx.send({
                    embed: {
                        title: ":x: Argument required",
                        description: `The argument ${prop} is required.`,
                        color: 0xFF0000,
                        footer: {
                            text: `Sosamba v${version}`
                        }
                    }
                });
                throw new ParsingError("Required argument not used");
            }
        }
        return output;
    }
}

module.exports = SwitchArgumentParser;