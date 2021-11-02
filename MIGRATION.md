# Migrating from Sosamba v1.x.x
- Sosamba has switched over to Discord's slash commands.
- `Command#argParser`, `Command#displayInHelp`, and `Command#aliases` are no longer applicable
- `Command#args` is now a list of slash command options as defined by Discord
- Commands will be passed a `InteractionContext` instead of a old `Context`
    - `Context` will still be passed for message listeners
- Removed `MessageAwaiter#askYesNo`; use components/buttons instead


```diff
const {
    Command,
-   SerializedArgumentParser,
-   Serializers: { Member }
+   Eris: { ApplicationCommandOptionTypes }
} = require("sosamba");

class TestCommand extends Command {
    constructor(sosamba, ...args) {
        super(sosamba, ...args, {
            name: "test",
            description: "A testing command",
-           args: "[command:String]"
-           argParser: new SerializedArgumentParser(sosamba, {
-               args: [{
-                   name: "arg1",
-                   type: Member,
-                   description: "a description"
-               }]
-           }),
-           displayInHelp: false,
-           aliases: ["t"],
+           args: [{
+               name: "arg1",
+               type: ApplicationCommandOptionTypes.MEMBER,
+               description: "a description"
+           }]
        });
    }

-   async run(ctx, [ arg1 ]) {
+   async run(ctx, { arg1 }) {
        // code
    }
}

module.exports = TestCommand;
```