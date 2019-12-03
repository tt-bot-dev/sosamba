"use strict";
const SimpleArgumentParser = require("./SimpleArgumentParser");
const ParsingError = require("./ParsingError");
const primitiveSerializers = require("./switchSerializers/jsPrimitives");
const erisSerializers = require("./switchSerializers/erisObjects");
const { version } = require("../../package.json");
const { Colors } = require("../Constants");
const { Member, GuildChannel, User, Guild, Role } = require("eris");
const GlobalUser = require("../structures/serializer/GlobalUser");
const Integer = require("../structures/serializer/Integer");
const switchSerializers = {
    [String]: primitiveSerializers.string,
    [Boolean]: primitiveSerializers.boolean,
    [Number]: primitiveSerializers.number,
    [BigInt]: primitiveSerializers.number64bit,
    [Integer]: primitiveSerializers.int,
    [Member]: erisSerializers.member,
    [GuildChannel]: erisSerializers.channel,
    [User]: erisSerializers.user,
    [GlobalUser]: erisSerializers.globalUser,
    [Guild]: erisSerializers.guild,
    [Role]: erisSerializers.role
};
const NoneSymbol = Symbol("Sosamba.None");

class SerializedArgumentParser extends SimpleArgumentParser {
    constructor(sosamba, { filterEmptyArguments, allowQuotedString, separator, args }) {
        super(sosamba, { 
            filterEmptyArguments,
            allowQuotedString: allowQuotedString != null ? allowQuotedString : true, 
            separator, 
        });
        this.args = args;
    }

    async parse(content, ctx) {
        const newContent = super.parse(content).map(s => s.trim()),
            output = [],
            lastArgIdx = this.args.length - 1,
            lastArg = this.args[lastArgIdx],
            ignoredErrors = [];
        let nonRest, rest;
        if (lastArg.rest) {
            nonRest = newContent.slice(0, lastArgIdx);
            rest = newContent.slice(lastArgIdx).join(" ");
        } else {
            nonRest = newContent;
        }
        if (nonRest.length) {
            for (let idx in nonRest) {
                const data = this.args[idx];
                if (!data) break; // We don't have anything else to parse
                if (data.rest) throw new SyntaxError("Only the last argument can be a rest argument");
                try {
                    const d = await this.resolveArg(nonRest[idx], data, ctx, data.name);
                    output.push(d);
                } catch (e) {
                    if ((e instanceof ParsingError) && e.ignore) ignoredErrors.push(idx);
                    else throw new ParsingError("Cannot parse the arguments");
                }
            }
        }
        if (rest) {
            try {
                const d = await this.resolveArg(rest, lastArg, ctx, lastArg.name);
                output.push(d);
            } catch (e) {
                if ((e instanceof ParsingError) && e.ignore) ignoredErrors.push(0);
                else throw new ParsingError("Cannot parse the arguments");
            }
        }
        for (const prop in this.args) {
            if (Object.prototype.hasOwnProperty.call(output, prop) && output[prop]) continue;
            const arg = this.args[prop];
            if (Object.prototype.hasOwnProperty.call(arg, "default")) {
                if (arg.default === NoneSymbol) {
                    output[prop] = null;
                    continue;
                }
                const v = typeof arg.default === "function" ? await arg.default(ctx) : arg.default;
                if (!this.validateArg(v, arg.type)) {
                    ctx.send({
                        embed: {
                            title: ":x: Error parsing your arguments",
                            description: `I am unable to parse the argument ${arg.name || `#${prop}`} because the default value is of an incorrect type.`,
                            color: Colors.ERROR,
                            footer: {
                                text: `Please contact the command developers about this. | Sosamba v${version}`
                            }
                        }
                    }).then(null, () => "");
                    throw new ParsingError("Invalid argument type");
                }
                output[prop] = v;
            } else {
                if (ignoredErrors.includes(prop)) throw new ParsingError("Required argument not used");
                ctx.send({
                    embed: {
                        title: ":x: Argument required",
                        description: `The argument \`${arg.name || `#${prop}`}\` is required.`,
                        color: Colors.ERROR,
                        footer: {
                            text: `Sosamba v${version}`
                        }
                    }
                }).then(null, () => "");
                throw new ParsingError("Required argument not used");
            }
        }
        return output;
    }

    async resolveArg(content, data, ctx, propName = `#${this.args.indexOf(data) + 1}`) {
        let v;
        if (!content) {
            if (!Object.prototype.hasOwnProperty.call(data, "default")) {
                ctx.send({
                    embed: {
                        title: ":x: Argument required",
                        description: `The argument \`${propName}\` is required.`,
                        color: Colors.ERROR,
                        footer: {
                            text: `Sosamba v${version}`
                        }
                    }
                }).then(null, () => "");
                throw new ParsingError("Required argument not used");
            }
            else {
                if (data.default === NoneSymbol) {
                    return null;
                }
                const val = typeof data.default === "function" ? await data.default(ctx) : data.default;
                // The command creators should handle the type checking themselves
                if (Object.prototype.hasOwnProperty.call(switchSerializers, data.type) && !this.validateArg(val, data.type)) {
                    ctx.send({
                        embed: {
                            title: ":x: Error parsing your arguments",
                            description: `I am unable to parse the argument \`${propName}\` because the default value is of an incorrect type.`,
                            color: Colors.ERROR,
                            footer: {
                                text: `Please contact the command developers about this. | Sosamba v${version}`
                            }
                        }
                    }).then(null, () => "");
                    throw new ParsingError("Invalid default value");
                } else v = val;
            }
        } else {
            const argData = Object.assign({
                name: propName,
                isFromArgParser: true
            }, data);
            if (data.type) {
                if (!Object.prototype.hasOwnProperty.call(switchSerializers, data.type)) {
                    try {
                        v = await data.type(content, ctx, argData);
                    } catch (err) {
                        if (err instanceof ParsingError) {
                            ctx.send({
                                embed: {
                                    title: ":x: Error parsing your arguments",
                                    description: `I am unable to parse the argument \`${propName}\`: \`${err.message}\``,
                                    color: Colors.ERROR,
                                    footer: {
                                        text: `Please review your arguments and try again. | Sosamba v${version}`
                                    }
                                }
                            }).then(null, () => "");
                            throw err;
                        } else {
                            ctx.send({
                                embed: {
                                    title: ":x: Error parsing your arguments",
                                    description: `I am unable to parse the argument \`${propName}\` because of a coding error:\n\`\`\`js\n${err.stack}\n\`\`\``,
                                    color: Colors.ERROR,
                                    footer: {
                                        text: `Please tell the command developers about this. | Sosamba v${version}`
                                    }
                                }
                            }).then(null, () => "");
                            throw new ParsingError(`Cannot parse arguments due to the following error: \n${err.stack}\n`);
                        }
                    }
                } else {
                    try {
                        v = await switchSerializers[data.type](content, ctx, argData);
                    } catch (err) {
                        if (err instanceof ParsingError) {
                            if (!err.ignore) {
                                ctx.send({
                                    embed: {
                                        title: ":x: Error parsing your arguments",
                                        description: `I am unable to parse the argument \`${propName}\`: \`${err.message}\``,
                                        color: Colors.ERROR,
                                        footer: {
                                            text: `Please review your arguments and try again. | Sosamba v${version}`
                                        }
                                    }
                                }).then(null, () => "");
                            }

                            throw err;
                        } else {
                            ctx.send({
                                embed: {
                                    title: ":x: Error parsing your arguments",
                                    description: `I am unable to parse the argument \`${propName}\` because of a coding error:\n\`\`\`js\n${err.stack}\n\`\`\`\n[Report the issue on GitHub](https://github.com/tt-bot-dev/sosamba/issues)`,
                                    color: Colors.ERROR,
                                    footer: {
                                        text: `This is an issue with Sosamba's default serializers. Please report this issue on GitHub. | Sosamba v${version}`
                                    }
                                }
                            }).then(null, () => "");
                            throw new ParsingError(`Cannot parse arguments due to the following error: \n${err.stack}\n`);
                        }
                    }
                }
            }

        }
        return v;
    }
    validateArg(arg, type) {
        if (arg === NoneSymbol) return true;
        if ([Number, String, BigInt, Boolean].includes(type)) {
            return typeof arg === type.name.toLowerCase();
        } else {
            return (arg instanceof type);
        }
    }

    provideUsageString(detailed) {
        let string = "";
        if (detailed) {
            for (const i in this.args) {
                const arg = this.args[i];
                string += `\`${arg.name || `unnamed argument #${i + 1}`}\` - ${arg.description || "no description"} \n`;
            }
        } else {
            for (const arg of this.args) {
                string += arg.default ? "[" : "<";
                string += arg.name || "";
                string += Object.prototype.hasOwnProperty.call(switchSerializers, arg.type)? `:${arg.type.name}` : ((!arg.name && "unknown type") || "");
                string += (this.args[this.args.length - 1] === arg && arg.rest) ? "...": "";
                string += arg.default ? "]" : ">";
                string += " ";
            }
        }
        return string.trim();
    }
}

SerializedArgumentParser.None = NoneSymbol;

// Avoid modifying any parser stuff
SerializedArgumentParser._switchSerializers = Object.assign({}, switchSerializers);
module.exports = SerializedArgumentParser;