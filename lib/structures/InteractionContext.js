"use strict";

class InteractionContext {
    constructor(sosamba, interaction) {
        this.sosamba = sosamba;

        this.guild = interaction.guildID && (this.sosamba.guilds.get(interaction.guildID) ?? {
            id: interaction.guildID
        });

        this.channel = interaction.channel;

        this.author = interaction.user ?? interaction.member.user;
        this.member = interaction.member;

        this.interaction = interaction;

        this.subcommandGroup = null;
        this.subcommand = null;
    }

    async acknowledge(...args) {
        return this.interaction.acknowledge(...args);
    }

    async send(content, file) {
        return this.interaction.createMessage({
            ...typeof content === "object" ? content : { content },
            file,
        });
    }

    askYesNo(...args) {
        return this.sosamba.componentAwaiter.askYesNo(this, ...args);
    }

    withButton(data) {
        return {
            ...data,
            type: 2,
            custom_id: data.custom_id ? `sosamba:${this.interaction.id}:${data.custom_id}` : undefined
        };
    }

    createYesNoButtons(colored = true) {
        return colored ? [
            this.withButton({
                custom_id: "askYesNo:yes",
                type: 2,
                style: 3,
                label: "Yes"
            }),
            this.withButton({
                custom_id: "askYesNo:no",
                type: 2,
                style: 4,
                label: "No"
            })
        ] : [
            this.withButton({
                custom_id: "askYesNo:yes",
                type: 2,
                style: 2,
                label: "Yes",
                emoji: {
                    name: "✅"
                }
            }),
            this.withButton({
                custom_id: "askYesNo:no",
                type: 2,
                style: 2,
                label: "No",
                emoji: {
                    name: "❌"
                }
            }),
        ];
    }
}

module.exports = InteractionContext;