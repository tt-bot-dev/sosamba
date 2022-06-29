"use strict";

const { Constants: { InteractionTypes } } = require("eris");

const InteractionListener = require("../structures/InteractionListener");

class ModalAwaiter extends InteractionListener {
    listeners = new Map();

    constructor(...args) {
        super(...args);
    }

    prerequisites(ctx) {
        if (ctx.interaction.type !== InteractionTypes.MODAL_SUBMIT) return;
        if (!ctx.interaction.data.custom_id.startsWith("sosamba:")) return;

        const { 1: interactionID } = ctx.interaction.data.custom_id.split(":");

        return this.listeners.has(interactionID);
    }

    async run(ctx) {
        const [, interactionID, ...data] = ctx.interaction.data.custom_id.split(":");
        
        const d = this.listeners.get(interactionID);

        ctx.componentData = data.join(":");

        if (d.timeout) clearTimeout(d.timeout);

        d.rs(ctx);
        this.listeners.delete(interactionID);
    }

    awaitModal(ctx, timeout) {
        return new Promise((rs, rj) => {
            if (this.listeners.has(ctx.interaction.id)) return rj(new Error("There's already an active listener for this interaction"));

            let t;
            if (timeout) t = setTimeout(() => {
                if (!this.listeners.has(ctx.interaction.id)) return;
                rj(new Error("Timed out"));
                this.listeners.delete(ctx.interaction.id);
            }, timeout);

            this.listeners.set(ctx.interaction.id, {
                rs,
                timeout: t,
            });
        });

    }
}

module.exports = ModalAwaiter;
