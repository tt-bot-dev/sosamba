"use strict";
const SerializedArgumentParser = require("./SerializedArgumentParser");
const {prototype: {parse}} = require("./SimpleArgumentParser");
const ParsingError = require("./ParsingError");
const { Colors } = require("../Constants");
const { version } = require("../../package.json");
/**
 * An argument parser that parses by "switches"
 * @extends {Sosamba.SimpleArgumentParser}
 * @memberof Sosamba
 */
class SwitchArgumentParser extends SerializedArgumentParser {
    /**
     * Construct a switch argument parser
     * @param {Sosamba.Client} sosamba The client
     * @param {object} args The arguments to parse, where the key is the argument and the value is of the {@link Sosamba.SerializedArgumentParser.ArgumentOptions} type.
     */
    constructor(sosamba, args) {
        super(sosamba, {
            allowQuotedString: true,
            separator: " ",
            args // Convenience af
        });
    }

    /**
     * Parses the content
     * @param {string} content The content to parse
     * @param {Context} ctx The context used for parsing the switches (serializing and throwing errors, respectively)
     * @returns {object} An object, where the key is the argument name and the value is of the type specified in the options.
     */
    async parse(content, ctx) {
        const parsedContent = parse.call(Object.assign({}, this, {
            separator: content.includes("|") ? "|" : " "
        }), content);
        const ignoredErrors = [];
        let output = {};
        for (let arg of parsedContent) {
            arg = arg.trim();
            const [propName, ...propVal] = arg.split(":");
            if (!this.args.hasOwnProperty(propName)) continue; // There's no need to parse what we don't need
            const argument = this.args[propName];
            const val = propVal.join(" ").trim();
            try {
                const d = await this.resolveArg(val, argument, ctx, propName);
                output[propName] = d;
            } catch (e) {
                if ((e instanceof ParsingError) && e.ignore) {
                    ignoredErrors.push(propName);
                } else throw new ParsingError("Cannot parse the arguments");
            }
        }
        for (const prop of Object.keys(this.args)) {
            if (output.hasOwnProperty(prop) && output[prop]) continue;
            const arg = this.args[prop];
            if (arg.hasOwnProperty("default")) {
                const v = typeof arg.default === "function" ? await arg.default(ctx) : arg.default;
                if (!this.validateArg(v, arg.type)) {
                    ctx.send({
                        embed: {
                            title: ":x: Error parsing your arguments",
                            description: `I am unable to parse the argument ${prop} because the default value is of an incorrect type.`,
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
                        description: `The argument ${prop} is required.`,
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
}

module.exports = SwitchArgumentParser;