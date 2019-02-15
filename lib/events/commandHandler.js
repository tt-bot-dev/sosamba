const { Event } = require("../..");
const { get } = require("../Structures");
// Thank the code reuse gods
const {prototype: {parse: simpleParse}} = require("../argParsers/SimpleArgumentParser");

class CommandHandler extends Event {
    constructor(...args) {
        super(...args, {
            name: "toinvokeCommand",
            once: false
        });
    }
    run(msg, prefix) {
        this.log.info(`Treating ${msg.content} as command input`);
        const text = msg.content.slice(prefix.length);
        if (!text) return;
        const [command, ...args] = simpleParse.call({ // Mock the constructed parser
            filterEmptySpaces: false,
        }, text);
        const cmd = this.sosamba.commands.get(command.toLowerCase())
        if (!cmd) return;

        const ctx = get("Context");
        const context = new ctx(this.sosamba, msg);
        const argParser = cmd.argParser;
        let arg = args.join(" ");
        if (argParser) arg = argParser.parse(arg, context);
        this.log.debug(`Running the command ${command} with arguments`, arg)
        cmd.run(context, arg);
    }
}

module.exports = CommandHandler;