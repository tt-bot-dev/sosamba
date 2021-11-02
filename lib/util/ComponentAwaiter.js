"use strict";

const { Constants: { InteractionTypes }} = require("eris");
const InteractionListener = require("../structures/InteractionListener");

class ComponentAwaiter extends InteractionListener {
    anyListeners = new Map();
    listeners = new Map();

    constructor(...args) {
        super(...args);
    }

    prerequisites(ctx) {
        if (ctx.interaction.type !== InteractionTypes.MESSAGE_COMPONENT) return;
        if (!ctx.interaction.data.custom_id.startsWith("sosamba:")) return;

        const {1: interactionID} = ctx.interaction.data.custom_id.split(":");

        return this.anyListeners.has(interactionID) || this.listeners.has(`${interactionID}:${ctx.author.id}`);
    }

    async run(ctx) {
        let isAny = false, d;
        const [, interactionID, ...data] = ctx.interaction.data.custom_id.split(":");
        if (d = this.anyListeners.get(interactionID)) isAny = true;
        else d = this.listeners.get(`${interactionID}:${ctx.author.id}`);

        ctx.componentData = data.join(":");

        if (d.filter && !await d.filter(ctx)) return;
        if (d.timeout) clearTimeout(d.timeout);

        d.rs(ctx);
        this[isAny ? "anyListeners" : "listeners"].delete(interactionID);
    }


    withButton(ctx, data) {
        return {
            ...data,
            custom_id: `sosamba:${ctx.interaction.id}:${data.custom_id}`
        };
    }

    waitForComponent(ctx, filter, timeout) {
        return new Promise((rs, rj) => {
            if (this.listeners.has(`${ctx.interaction.id}:${ctx.author.id}`)) return rj(new Error("There's already an active listener for this interaction"));
            let t;
            if (timeout) t = setTimeout(() => {
                if (!this.listeners.has(`${ctx.interaction.id}:${ctx.author.id}`)) return;
                rj(new Error("Timed out"));
                this.listeners.delete(`${ctx.interaction.id}:${ctx.author.id}`);
            }, timeout);

            this.listeners.set(`${ctx.interaction.id}:${ctx.author.id}`, {
                filter,
                rs,
                timeout: t
            });
        });
    }

    waitForAnyComponent(ctx, filter, timeout) {
        return new Promise((rs, rj) => {
            if (this.anyListeners.has(ctx.interaction.id)) return rj(new Error("There's already an active listener for this interaction"));
            let t;
            if (timeout) t = setTimeout(() => {
                if (!this.anyListeners.has(ctx.interaction.id)) return;
                rj(new Error("Timed out"));
                this.anyListeners.delete(ctx.interaction.id);
            }, timeout);

            this.anyListeners.set(ctx.interaction.id, {
                filter,
                rs,
                timeout: t
            });
        });
    }

    askYesNo(ctx) {
        return {
            waitForResponse: async (returnCtx = false) => {
                try {
                    const c = await this.waitForComponent(ctx, 
                        c => ["askYesNo:yes", "askYesNo:no"].includes(c.componentData),
                        10000);
                    
                    const r = c.componentData === "askYesNo:yes";

                    return returnCtx ? {
                        response: r,
                        context: c
                    } : r;
                } catch(err) {
                    return returnCtx ? {
                        response: false,
                        context: null,
                    } : false;
                }
            }
        }
    }

    /*async askYesNo(ctx, returnCtx = false) {
        try {
            const c = await this.waitForComponent(ctx, 
                c => ["askYesNo:yes", "askYesNo:no"].includes(c.componentData),
                10000);
            
            const r = c.componentData === "askYesNo:yes";

            return returnCtx ? {
                response: r,
                context: c
            } : r;
        } catch(err) {
            return returnCtx ? {
                response: false,
                context: null,
            } : false;
        }
    }*/
}

module.exports = ComponentAwaiter;
