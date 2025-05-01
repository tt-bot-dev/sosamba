"use strict";
const { Event } = require("../..");
const InteractionContext = require("../structures/InteractionContext");
const { Constants: { InteractionTypes, ApplicationCommandOptionTypes, MessageFlags, ComponentTypes, ButtonStyles } } = require("@projectdysnomia/dysnomia");
const { version } = require("../../package.json");
const Constants = require("../Constants");

class InteractionCreateHandler extends Event {
    constructor(...args) {
        super(...args, {
            name: "interactionCreate",
            once: false,
        });
    }

    /**
     * @param {ApplicationCommandOptionTypes[keyof ApplicationCommandOptionTypes]} type 
     */
    _getFriendlyCommandTypeName(type) {
        switch (type) {
        case ApplicationCommandOptionTypes.SUB_COMMAND: return "subcommand";
        case ApplicationCommandOptionTypes.SUB_COMMAND_GROUP: return "subcommand group";
        case ApplicationCommandOptionTypes.BOOLEAN: return "boolean";
        case ApplicationCommandOptionTypes.CHANNEL: return "channel";
        case ApplicationCommandOptionTypes.INTEGER: return "integer";
        case ApplicationCommandOptionTypes.MENTIONABLE: return "user|role";
        case ApplicationCommandOptionTypes.NUMBER: return "number";
        case ApplicationCommandOptionTypes.ROLE: return "role";
        case ApplicationCommandOptionTypes.STRING: return "string";
        case ApplicationCommandOptionTypes.USER: return "user";
        case ApplicationCommandOptionTypes.ATTACHMENT: return "attachment";
        }
    }

    /**
     * 
     * @param {import("@projectdysnomia/dysnomia").ApplicationCommandOption[]} opts
     */
    _getFriendlyCommandOption(opts) {
        if (!opts) return "(no arguments)";

        // This intentionally does not cover nesting.
        return opts.map(opt => `${opt.required != null ? opt.required ? "<" : "[" : ""}${opt.name}: ${opt.choices ? 
            opt.choices.map(o => o.name).join("|") :
            this._getFriendlyCommandTypeName(opt.type)}${opt.required != null ? opt.required ? ">" : "]" : ""}`).join(" ");
    }

    async prerequisites() {
        return this.sosamba._isReady;
    }

    /**
     * @param {import("@projectdysnomia/dysnomia").EventListeners["interactionCreate"][number]} interaction
     */
    async run(interaction) {
        const ctx = new InteractionContext(this.sosamba, interaction);

        switch (interaction.type) {
        case InteractionTypes.PING: {
            /**
             * @param {import("@projectdysnomia/dysnomia").PingInteraction} interaction
             */

            await interaction.pong();
            break;
        }

        case InteractionTypes.APPLICATION_COMMAND: {
            /**
             * @type {import("eris").CommandInteraction}
             */
            const i = interaction;

            const cmd = this.sosamba.commands.get(i.data.id);

            // ??? probably we received a command not registered here
            // maybe command fan-out? who knows...
            if (!cmd) return;

            if (cmd.guildOnly && !i.guild) {
                await interaction.createMessage({
                    flags: MessageFlags.IS_COMPONENTS_V2,
                    components: [
                        {
                            type: ComponentTypes.CONTAINER,
                            components: [
                                {
                                    type: ComponentTypes.TEXT_DISPLAY,
                                    content: "# :x: This command cannot be run in Direct Messages" +
                                        "\nThis command must be run within a server. Try adding me to a server using the following button and running the command there!",
                                },
                                {
                                    type: ComponentTypes.ACTION_ROW,
                                    components: [
                                        {
                                            type: ComponentTypes.BUTTON,
                                            style: ButtonStyles.LINK,
                                            url: `https://discord.com/oauth2/authorize?client_id=${this.sosamba.application.id}&scope=bot+applications.commands`,
                                            label: "Add to a server",
                                        },
                                    ],
                                },
                                {
                                    type: ComponentTypes.TEXT_DISPLAY,
                                    content: `-# Sosamba v${version}`,
                                },
                            ],
                            accent_color: Constants.Colors.ERROR,
                        },
                    ],
                });
                return;
            }

            let opts = i.data.options;

            if (opts?.[0].type === ApplicationCommandOptionTypes.SUB_COMMAND_GROUP) {
                ctx.subcommandGroup = opts[0].name;
                opts = opts[0].options;
            }

            if (opts?.[0].type === ApplicationCommandOptionTypes.SUB_COMMAND) {
                ctx.subcommand = opts[0].name;
                opts = opts[0].options;
            }
            const commandDef = this._findCommandDef(ctx, cmd);

            if (opts?.some(ido => ido.type !== commandDef.options.find(opt => opt.name === ido.name)?.type)) {
                await i.createMessage({
                    flags: MessageFlags.IS_COMPONENTS_V2,
                    components: [
                        {
                            type: ComponentTypes.CONTAINER,
                            components: [
                                {
                                    type: ComponentTypes.TEXT_DISPLAY,
                                    content: "# :x: Error running the command" +
                                        "\nI am unable to run the command because the received arguments don't match up with the local definition." +
                                        "\n## Expected" +
                                        `\n${this._getFriendlyCommandOption(commandDef.options)}` +
                                        "\n## Received" +
                                        `\n${this._getFriendlyCommandOption(opts)}`,
                                },
                                {
                                    type: ComponentTypes.SEPARATOR,
                                    divider: true,
                                },
                                {
                                    type: ComponentTypes.TEXT_DISPLAY,
                                    content: "Try running this command later. If the issue still persists even after one hour, please contact the command developers." +
                                        `\n-# Sosamba v${version}`,
                                },
                            ],
                            accent_color: Constants.Colors.ERROR,
                        },
                    ],
                });

                return;
            }
                
            const args = this.resolveArguments(opts, i);

            try {
                if (await cmd.permissionCheck(ctx)) {
                    await cmd.run(ctx, args);
                } else {
                    await interaction.createMessage({
                        flags: MessageFlags.IS_COMPONENTS_V2 | MessageFlags.EPHEMERAL,
                        components: [
                            {
                                type: ComponentTypes.CONTAINER,
                                components: [
                                    {
                                        type: ComponentTypes.TEXT_DISPLAY,
                                        content: "# :x: You cannot run this command" +
                                            "\nPlease obtain the required permissions and try again." +
                                            `\n-# Sosamba v${version}`,
                                    },
                                ],
                            },
                        ],
                    });
                }
            } catch (e) {
                if (!this.sosamba.emit("commandError", e, ctx)) {
                    this.log.error(e);

                    await interaction.createMessage({
                        flags: MessageFlags.IS_COMPONENTS_V2,
                        components: [
                            {
                                type: ComponentTypes.CONTAINER,
                                components: [
                                    {
                                        type: ComponentTypes.TEXT_DISPLAY,
                                        content: "# :x: Error running the command" +
                                            "\nI am unable to run the command because of a coding error. Please tell the command developers about this." +
                                            `\n\`\`\`js\n${e.stack}\n\`\`\`` +
                                            `\n-# Sosamba v${version}`,
                                    },
                                ],
                            },
                        ],
                    });
                }
            }

            break;
        }

        case InteractionTypes.APPLICATION_COMMAND_AUTOCOMPLETE: {
            /**
             * @type {import("eris").AutocompleteInteraction}
             */
            const i = interaction;

            const cmd = this.sosamba.commands.get(i.data.id);

            // ??? probably we received a command not registered here
            // maybe command fan-out? who knows...
            if (!cmd) return;

            if (cmd.guildOnly && !i.guild) {
                await interaction.result([]);
                return;
            }

            let opts = i.data.options;

            if (opts?.[0].type === ApplicationCommandOptionTypes.SUB_COMMAND_GROUP) {
                ctx.subcommandGroup = opts[0].name;
                opts = opts[0].options;
            }

            if (opts?.[0].type === ApplicationCommandOptionTypes.SUB_COMMAND) {
                ctx.subcommand = opts[0].name;
                opts = opts[0].options;
            }
            const commandDef = this._findCommandDef(ctx, cmd);

            if (opts?.some(ido => ido.type !== commandDef.options.find(opt => opt.name === ido.name)?.type)) {
                await i.result([]);
                return;
            }

            const args = this.resolveArguments(opts, i);

            const focus = {};
            opts.forEach(opt => {
                focus[opt.name] = !!opt.focused;
            });

            try {
                if (await cmd.permissionCheck(ctx)) {
                    await cmd.autocomplete(ctx, args, focus);
                } else {
                    await interaction.result([]);
                }
            } catch (e) {
                if (!this.sosamba.emit("commandError", e, ctx)) {
                    this.log.error(e);

                    await interaction.result([]);
                }
            }

            break;
        }
        }

        await Promise.all(this.sosamba.interactionListeners
            .map(async l => {
                if (await l.prerequisites(ctx)) await l.run(ctx);
            }),
        );
    }

    /**
     * @param {import("eris").CommandInteraction["data"]["options"]} options
     * @param {import("eris").CommandInteraction} interaction
     */
    resolveArguments(options, interaction) {
        if (!options?.length) return {};

        const o = {};

        options.forEach(opt => {
            if (Object.prototype.hasOwnProperty.call(o, opt.name)) {
                this.log.warn(`Received duplicate parameter ${opt.name} from Discord (interaction ID ${interaction.id})`);
            }
            o[opt.name] = this._resolveArgumentValue(opt, interaction);
        });

        return o;
    }


    _resolveArgumentValue(opt, interaction) {
        switch (opt.type) {
        case ApplicationCommandOptionTypes.USER: {
            const memberData = interaction.data.resolved?.members?.get(opt.value);
            const userData = interaction.data.resolved?.users?.get(opt.value);

            return memberData ?? userData;
        }

        case ApplicationCommandOptionTypes.CHANNEL: {
            return interaction.data.resolved?.channels?.get(opt.value);
        }

        case ApplicationCommandOptionTypes.ROLE: {
            return interaction.data.resolved?.roles?.get(opt.value);
        }

        case ApplicationCommandOptionTypes.MENTIONABLE: {
            const memberData = interaction.data.resolved?.members?.get(opt.value);
            const userData = interaction.data.resolved?.users?.get(opt.value);

            const roleData = interaction.data.resolved?.roles?.get(opt.value);

            return roleData ?? memberData ?? userData;
        }

        case ApplicationCommandOptionTypes.ATTACHMENT: {
            return interaction.data.resolved?.attachments?.get(opt.value);
        }

        // Directly pass through string/boolean/number
        case ApplicationCommandOptionTypes.STRING:
        case ApplicationCommandOptionTypes.BOOLEAN:
        case ApplicationCommandOptionTypes.INTEGER:
        case ApplicationCommandOptionTypes.NUMBER:
        default:
            return opt.value;
        }
    }

    _findCommandDef(ctx, cmd) {
        if (!cmd.args) return {
            options: [],
        };
        let def = {
            options: cmd.args,
        };

        if (ctx.subcommandGroup != null) def = def.options.find(a => a.name === ctx.subcommandGroup);
        if (ctx.subcommand != null) def = def.options.find(a => a.name === ctx.subcommand);

        return def;
    }
}

module.exports = InteractionCreateHandler;
