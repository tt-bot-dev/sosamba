"use strict";
const SerializedArgumentParser = require("./SerializedArgumentParser");
const { prototype: { parse } } = require("./SimpleArgumentParser");
const ParsingError = require("./ParsingError");
const { Colors } = require("../Constants");
const { version } = require("../../package.json");
//const switchSerializers = Object.assign({}, SerializedArgumentParser._switchSerializers);
class SwitchArgumentParser extends SerializedArgumentParser {
    constructor(sosamba, args) {
        super(sosamba, {
            allowQuotedString: true,
            separator: " ",
            args // Convenience af
        });
    }
    async parse(content, ctx) {
        const parsedContent = parse.call(Object.assign({}, this, {
            separator: content.includes("|") ? "|" : " "
        }), content);
        const ignoredErrors = [];
        let output = {};
        for (let arg of parsedContent) {
            arg = arg.trim();
            const [propName, ...propVal] = arg.split(":");
            if (!Object.prototype.hasOwnProperty.call(this.args, propName)) continue; // There's no need to parse what we don't need
            const argument = this.args[propName];
            const val = propVal.join(" ").trim();
            try {
                const d = await this.resolveArg(val, argument, ctx, propName);
                output[propName] = d;
            } catch (e) {
                if (e instanceof ParsingError && e.ignore) {
                    ignoredErrors.push(propName);
                } else throw new ParsingError("Cannot parse the arguments");
            }
        }
        for (const prop of Object.keys(this.args)) {
            if (Object.prototype.hasOwnProperty.call(output, prop) && output[prop]) continue;
            const arg = this.args[prop];
            if (Object.prototype.hasOwnProperty.call(arg, "default")) {
                if (arg.default === SerializedArgumentParser.None) {
                    output[prop] = null;
                    continue;
                }
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

    provideUsageString(detailed) {
        const k = Object.keys(this.args);
        let string = detailed ? "This command uses the switch syntax.\n" : "";
        for (const name of k) {
            const arg = this.args[name];
            if (detailed) {
                string += `\`${name}\` - ${arg.description || "no description"}\n`;
            } else {
                string += arg.default ? "[" : "<";
                string += name;
                const type = Array.isArray(arg.type) ? arg.type : [arg.type];
                string += ":" + type.map(t => {
                    if (Object.prototype.hasOwnProperty.call(SerializedArgumentParser._switchSerializers, t))
                        return t.name;
                    if (t.typeHint) return t.typeHint;
                    return "unknown type";
                }).join("|");
                string += arg.default ? "]" : ">";
                string += " ";
            }
        }

        if (!detailed) string += "(uses the switch syntax)";
        else string += "\n[How to read the arguments](https://github.com/tt-bot-dev/sosamba/wiki/Reading-arguments)";
        return string.trim();
    }
}

module.exports = SwitchArgumentParser;