"use strict";
const { Event } = require("../..");
const { STOP_BUTTON, STOP_REASONS, Colors } = require("../Constants");
const { version } = require ("../../package.json");

class ReactionMenuHandler extends Event {
    constructor(...args) {
        super(...args, {
            name: "messageReactionAdd",
            once: false
        });
    }
    prerequisites(msg, emoji, { id: userID }) {
        if (!this.sosamba.reactionMenus.has(msg.id)) return false;
        const menu = this.sosamba.reactionMenus.get(msg.id);
        if (menu.stopped) {
            this.sosamba.reactionMenus.remove(msg.id);
            return false;
        }
        if (menu.user !== userID) return false;
        if (emoji.name !== STOP_BUTTON && !Object.prototype.hasOwnProperty.call(menu.callbacks, emoji.id ? `${emoji.name}:${emoji.id}` : emoji.name)) return false;
        if (menu._timer) clearTimeout(menu._timer);
        return true;
    }
    async run(msg, emoji) {
        const menu = this.sosamba.reactionMenus.get(msg.id);
        const emote = emoji.id ? `${emoji.name}:${emoji.id}` : emoji.name;
        if (emote === STOP_BUTTON) {
            try {
                clearTimeout(menu._timer);
                await menu.stopCallback(STOP_REASONS.MANUAL);
            } catch (err) {
                menu.ctx.send({
                    embed: {
                        title: ":x: Error stopping the menu",
                        description: `I am unable to stop the menu because of a coding error:\n\`\`\`js\n${err.stack}\n\`\`\`\nI will forcefully remove the reaction menu, however, the menu might still listen to and accept some other events.`,
                        color: Colors.ERROR,
                        footer: {
                            text: `Please tell the command developers about this. | Sosamba v${version}`
                        }
                    }
                }).then(null, () => "");
            }
            if (this.sosamba.hasBotPermission(msg.channel, "manageMessages")) await msg.removeReaction(emote, menu.user);
            this.sosamba.reactionMenus.remove(menu);
            return;
        }
        try {
            if (await menu.canRunCallback(emote)) await menu.callbacks[emote](menu);
        } catch (err) {
            menu.ctx.send({
                embed: {
                    title: ":x: Error handling the reaction",
                    description: `I am unable to handle the reaction because of a coding error:\n\`\`\`js\n${err.stack}\n\`\`\``,
                    color: Colors.ERROR,
                    footer: {
                        text: `Please tell the command developers about this. | Sosamba v${version}`
                    }
                }
            }).then(null, () => "");
        }
        if (this.sosamba.hasBotPermission(msg.channel, "manageMessages")) {
            try {
                msg.removeReaction(emote, menu.user);
            } catch {
                this.log.error(msg);
            }
        }
        if (menu.timeout && !menu.stopped) menu._timer = setTimeout(() => {
            menu.stopCallback(STOP_REASONS.TIMEOUT);
            this.sosamba.reactionMenus.remove(menu);
        }, menu.timeout);
    }
}

module.exports = ReactionMenuHandler;
