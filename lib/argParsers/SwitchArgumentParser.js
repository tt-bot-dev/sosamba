"use strict";
const SimpleArgumentParser = require("./SimpleArgumentParser");
const ParsingError = require("./ParsingError");
const primitiveSerializers = require("./switchSerializers/jsPrimitives");
const { version } = require("../../package.json");
const switchSerializers = {
    [String]: primitiveSerializers.string,
    [Boolean]: primitiveSerializers.boolean,
    [Number]: primitiveSerializers.number,
    [BigInt]: primitiveSerializers.number64bit
};

/**
 * An argument parser that parses by "switches"
 * @extends {SimpleArgumentParser}
 */
class SwitchArgumentParser extends SimpleArgumentParser {
    /**
     * The options of an argument
     * @typedef {object} ArgumentOptions
     * @memberof SwitchArgumentParser
     * @property {any} default The default value, depending on the serializer
     * @property {any} type Any serializable type: 
     * - {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number|Number}
     * - {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String|String}
     * - {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/BigInt|BigInt}
     * - {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Boolean|Boolean}
     * 
     */



    /**
     * Construct a switch argument parser
     * @param {SosambaClient} sosamba The client
     * @param {object} args The arguments to parse, where the key is the argument and the value is of the {@link ArgumentOptions} type.
     */
    constructor(sosamba, args) {
        super(sosamba, {
            allowQuotedString: true,
            separator: " "
        });
        /**
         * The arguments to parse
         * @type {object}
         */
        this.args = args;
    }
    
    /**
     * Parses the content
     * @param {string} content The content to parse
     * @param {Context} ctx The context used for parsing the switches (serializing and throwing errors, respectively)
     * @returns {object} An object, where the key is the argument name and the value is of the type specified in the options.
     */
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
                    }).then(null, () => "");
                    throw new ParsingError("Required argument not used");
                }
                else {
                    const val = typeof argument.default === "function" ? argument.default(ctx) : argument.default;
                    if ([Number, String, BigInt, Boolean].includes(argument.type)) {
                        if (typeof val !== argument.type.name.toLowerCase()) {
                            ctx.send({
                                embed: {
                                    title: ":x: Error parsing your arguments",
                                    description: `I am unable to parse the argument ${propName} because the default value is of an incorrect type.`,
                                    color: 0xFF0000,
                                    footer: {
                                        text: `Please contact the command developers about this. | Sosamba v${version}`
                                    }
                                }
                            }).then(null, () => "");
                            return;
                        }
                    } else {
                        if (!(val instanceof argument.type)) {
                            ctx.send({
                                embed: {
                                    title: ":x: Error parsing your arguments",
                                    description: `I am unable to parse the argument ${propName} because the default value is of an incorrect type.`,
                                    color: 0xFF0000,
                                    footer: {
                                        text: `Please contact the command developers about this. | Sosamba v${version}`
                                    }
                                }
                            }).then(null, () => "");
                            return;
                        }
                    }
                }
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
                                }).then(null, () => "");
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
                                }).then(null, () => "");
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
                                }).then(null, () => "");
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
                                }).then(null, () => "");
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
                }).then(null, () => "");
                throw new ParsingError("Required argument not used");
            }
        }
        return output;
    }
}

module.exports = SwitchArgumentParser;