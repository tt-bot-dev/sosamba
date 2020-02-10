// An example command module using the Sosamba framework
const { Command, SerializedArgumentParser, 
    Eris: { Member } } = require("sosamba");

class HiCommand extends Command {
    constructor(sosamba, ...args) {
        super(sosamba, ...args, {
            name: "hi",
            description: "Says \"hi\" to a user or to anything else",
            argParser: new SerializedArgumentParser(sosamba, {
                args: [{
                    // If a single type should be checked it doesn't have to be an array
                    type: [Member, String], 
                    default: "world",
                    name: "who",
                    description: "Who to say hi to"
                }]
            })
        })
    }

    // The arguments get passed from the SerializedArgumentParser
    async run(ctx, [who]) {
        await ctx.send(`hi, ${who.mention || who}`);
    }
}
module.exports = HiCommand;