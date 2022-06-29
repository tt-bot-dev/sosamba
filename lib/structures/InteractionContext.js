"use strict";

const { Constants: { InteractionTypes } } = require("eris");

class InteractionContext {
    constructor(sosamba, interaction) {
        this.sosamba = sosamba;

        this.guild = interaction.guildID && (this.sosamba.guilds.get(interaction.guildID) ?? {
            id: interaction.guildID,
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
        if (this.interaction.acknowledged) return this.interaction.editOriginalMessage({
            ...typeof content === "object" ? content : { content },
            file,
        });

        return this.interaction.createMessage({
            ...typeof content === "object" ? content : { content },
            file,
        });
    }

    askYesNo(...args) {
        return this.sosamba.componentAwaiter.askYesNo(this, ...args);
    }

    createModal(modalData) {
        if (this.sosamba.interaction.type === InteractionTypes.MODAL_SUBMIT) 
            return Promise.reject(new Error("Cannot respond to a modal submit with a modal"));
        
        return this.interaction.createModal({
            ...modalData,
            custom_id: modalData.custom_id ? `sosamba:${this.interaction.id}:${data.custom_id}` : `sosamba:${this.interaction.id}`,
        });
    }

    awaitModal(...args) {
        return this.sosamba.modalAwaiter.awaitModal(this, ...args);
    }

    withButton(data) {
        return {
            type: 2,
            ...data,
            custom_id: data.custom_id ? `sosamba:${this.interaction.id}:${data.custom_id}` : undefined,
        };
    }

    createYesNoButtons(colored = true) {
        return colored ? [
            this.withButton({
                custom_id: "askYesNo:yes",
                type: 2,
                style: 3,
                label: "Yes",
            }),
            this.withButton({
                custom_id: "askYesNo:no",
                type: 2,
                style: 4,
                label: "No",
            }),
        ] : [
            this.withButton({
                custom_id: "askYesNo:yes",
                type: 2,
                style: 2,
                label: "Yes",
                emoji: {
                    name: "✅",
                },
            }),
            this.withButton({
                custom_id: "askYesNo:no",
                type: 2,
                style: 2,
                label: "No",
                emoji: {
                    name: "❌",
                },
            }),
        ];
    }
}

module.exports = InteractionContext;
