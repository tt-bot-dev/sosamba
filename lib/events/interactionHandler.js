"use strict";
const { Event } = require("../..");
const InteractionContext = require("../structures/InteractionContext");
const { Constants: { InteractionTypes, ApplicationCommandOptionTypes } } = require("eris");
const { version } = require("../../package.json");

const INTERACTION_TYPE_MODAL_SUBMIT = 5; // Magic value - change to Eris' constants as soon as the appropriate PR is released!

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
        }
    }

    /**
     * 
     * @param {import("eris").SlashCommandOptions[]} opts 
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
     * @param {import("eris").EventListeners["interactionCreate"][number]} interaction 
     */
    async run(interaction) {
        const ctx = new InteractionContext(this.sosamba, interaction);

        switch (interaction.type) {
        case InteractionTypes.PING: {
            /**
                 * @param {import("eris").PingInteraction} interaction
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
            if (!cmd) return await interaction.acknowledge();

            if (cmd.guildOnly && !i.guildID) {
                await interaction.createMessage({
                    embeds: [{
                        title: ":x: This command cannot be run in Direct Messages",
                        description: "This command must be run within a server.",
                        color: 0xFF0000,
                        footer: {
                            text: `Try adding me to a server using the following button and running the command there! | Sosamba v${version}`,
                        },
                    }],
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
                    embeds: [{
                        title: ":x: Error running the command",
                        description: "I am unable to run the command because the received arguments don't match up with the local definition.",
                        fields: [{
                            name: "Expected",
                            value: this._getFriendlyCommandOption(commandDef.options),
                        }, {
                            name: "Received",
                            value: this._getFriendlyCommandOption(opts),
                        }],
                        color: 0xFF0000,

                        footer: {
                            text: `Try running this command later. If the issue still persists even after one hour, please contact the command developers. | Sosamba v${version}`,
                        },
                    }],
                });

                return;
            }
                
            const args = this.resolveArguments(opts, i);

            try {
                if (await cmd.permissionCheck(ctx)) {
                    await cmd.run(ctx, args);
                } else {
                    await interaction.createMessage({
                        embeds: [{
                            title: ":x: You cannot run this command",
                            description: "Please obtain the required permissions and try again.",
                            color: 0xFF0000,
                            footer: {
                                text: `Sosamba v${version}`,
                            },
                        }],
                        flags: 64,
                    });
                }
            } catch (e) {
                if (!this.sosamba.emit("commandError", e, ctx)) {
                    this.log.error(e);

                    await interaction.createMessage({
                        embeds: [{
                            title: ":x: Error running the command",
                            description: `I am unable to run the command because of a coding error:\n\`\`\`js\n${e.stack}\n\`\`\``,
                            color: 0xFF0000,
                            footer: {
                                text: `Please tell the command developers about this. | Sosamba v${version}`,
                            },
                        }],
                    });
                }
            }

            break;
        }

        case INTERACTION_TYPE_MODAL_SUBMIT: {
            break;
        }

        default: {
            await interaction.acknowledge();
        }
        }

        for (const l of this.sosamba.interactionListeners.values()) {
            if (await l.prerequisites(ctx)) await l.run(ctx);
        }

        if (!interaction.acknowledged) await interaction.acknowledge();
    }

    /**
     * @param {import("eris").CommandInteraction["data"]["options"]} options
     * @param {import("eris").CommandInteraction} interaction 
     * @param {import("../..").Command} cmd
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
