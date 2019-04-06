"use strict";
const SimpleArgumentParser = require("./SimpleArgumentParser");
const ParsingError = require("./ParsingError");
const primitiveSerializers = require("./switchSerializers/jsPrimitives");
const erisSerializers = require("./switchSerializers/erisObjects");
const { version } = require("../../package.json");
const { Colors } = require("../Constants");
const { Member, GuildChannel, User, Guild } = require("eris");
const GlobalUser = require("../structures/GlobalUser");
const switchSerializers = {
    [String]: primitiveSerializers.string,
    [Boolean]: primitiveSerializers.boolean,
    [Number]: primitiveSerializers.number,
    [BigInt]: primitiveSerializers.number64bit,
    [Member]: erisSerializers.member,
    [GuildChannel]: erisSerializers.channel,
    [User]: erisSerializers.user,
    [GlobalUser]: erisSerializers.globalUser,
    [Guild]: erisSerializers.guild
};

/**
 * An argument parser that serializes the resolved data
 * @extends {Sosamba.SimpleArgumentParser}
 * @memberof Sosamba
 */
class SerializedArgumentParser extends SimpleArgumentParser {
    /**
     * The options of an argument
     * @typedef {object} ArgumentOptions
     * @memberof Sosamba.SerializedArgumentParser
     * @property {any} [default] The default value, depending on the serializer
     * @property {any} type Any serializable type: 
     * - {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number|Number}
     * - {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String|String}
     * - {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/BigInt|BigInt}
     * - {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Boolean|Boolean}
     * - {@link https://abal.moe/Eris/docs/Member|Member}
     * - {@link https://abal.moe/Eris/docs/GuildChannel|GuildChannel}
     * - {@link https://abal.moe/Eris/docs/User|User} (just in the guild by default, in order to globally look up, use {@link GlobalUser})
     * - {@link https://abal.moe/Eris/docs/Guild|Guild}
     * @property {string} [name] The friendly name for the argument (SerializedargumentParser only)
     * @property {boolean} [rest] Whether the argument is a rest argument (SerializedargumentParser only)
     */

    /**
     * Serialized argument option
     * @typedef {object} SerializedArgumentParserOptions
     * @memberof Sosamba.SerializedArgumentParser
     * @extends Sosamba.SimpleArgumentParserOptions
     * @prop {ArgumentOptions[]} args The argument options
     */

    /**
     * 
     * @param {Sosamba.Client} sosamba The client
     * @param {SerializedArgumentParserOptions} options The options for the parser
     */
    constructor(sosamba, { filterEmptyArguments, allowQuotedString, separator, args }) {
        super(sosamba, { filterEmptyArguments, allowQuotedString, separator, });
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
                if ((e instanceof ParsingError) && e.ignore) ignoredErrors.push(idx);
                else throw new ParsingError("Cannot parse the arguments")
            }
        }
        console.log(output)
        for (const prop in this.args) {
            if (output.hasOwnProperty(prop) && output[prop]) continue;
            const arg = this.args[prop];
            if (arg.hasOwnProperty("default")) output[prop] = typeof arg.default === "function" ? await arg.default(ctx) : arg.default;
            else {
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

    /**
     * Resolves an argument to a specified value
     * @param {string} content The data to resolve
     * @param {ArgumentOptions} data The argument options
     * @param {Sosamba.Context} ctx The context
     * @param {string} propName How to call the argument
     */
    async resolveArg(content, data, ctx, propName = `#${this.args.indexOf(data) + 1}`) {
        let v = undefined;
        if (!content) {
            if (!data.hasOwnProperty("default")) {
                ctx.send({
                    embed: {
                        title: ":x: Argument required",
                        description: `The argument \`${propName}\` is required.`,
                        color: 0xFF0000,
                        footer: {
                            text: `Sosamba v${version}`
                        }
                    }
                }).then(null, () => "");
                throw new ParsingError("Required argument not used");
            }
            else {
                const val = typeof data.default === "function" ? await data.default(ctx) : data.default;
                // The command creators should handle the type checking themselves
                if (switchSerializers.hasOwnProperty(data.type) && !this.validateArg(val, data.type)) {
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
                    throw new ParsingError("Invalid default value")
                } else v = val;
            }
        } else {
            if (data.type) {
                if (!switchSerializers.hasOwnProperty(data.type)) {
                    try {
                        v = await data.type(content, ctx);
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
                        v = await switchSerializers[data.type](content, ctx);
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
                            };

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
    /**
     * Validates the type of the argument
     * @param {any} arg The argument to check the type against
     * @param {any} type The argument type
     * @returns {boolean} Whether the value is valid or not
     */
    validateArg(arg, type) {
        if ([Number, String, BigInt, Boolean].includes(type)) {
            return typeof arg === type.name.toLowerCase()
        } else {
            return (arg instanceof type);
        }
    }
}
module.exports = SerializedArgumentParser;