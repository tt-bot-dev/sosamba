"use strict";
const { STOP_REASONS, Colors, STOP_BUTTON } = require("../Constants");
const { version } = require("../../package.json");
/**
 * A reaction menu. In order to implement a reaction menu, the developer
 * needs to implement this class.
 */
class ReactionMenu {
    constructor(ctx, msg) {
        this.sosamba = ctx.sosamba;
        this.user = ctx.author.id;
        this.callbacks = {};
        this.ctx = ctx;
        this.context = this.ctx;
        this.message = msg;
        this.id = this.message.id;
        this.timeout = false;
    }

    // eslint-disable-next-line no-unused-varas
    canRunCallback(emoji) {
        return true;
    }

    async prepareEmoji() {
        if (!this.sosamba.hasBotPermission(this.ctx.channel, "addReactions")) {
            throw new Error("Cannot add reactions :(");
        }
        for (const emoji of [STOP_BUTTON, ...Object.keys(this.callbacks)]) await this.message.addReaction(emoji);
    }

    async stopCallback(reason) {
        if (this.sosamba.hasBotPermission(this.message.channel, "manageMessages")) await this.message.removeReactions();
        if (reason === STOP_REASONS.MANUAL) {
            this.ctx.send({
                embed: {
                    title: ":white_check_mark: Left the reaction menu successfully.",
                    description: "Feel free to do something else now.",
                    color: Colors.SUCCESS,
                    footer: {
                        text: `Sosamba v${version}`
                    }
                }
            }).then(null, () => "");
        } else if (reason === STOP_REASONS.TIMEOUT) {
            this.ctx.send({
                embed: {
                    title: ":stopwatch: The reaction menu timed out.",
                    description: "If this is expected, feel free to do something else now. Else, please re-run the command.\nIn case the reaction menu times out too quickly, contact the bot developers about this.",
                    color: Colors.WARN,
                    footer: {
                        text: `Sosamba v${version}`
                    }
                }
            }).then(null, () => "");
        } else if (reason === STOP_REASONS.CANNOT_ADD_REACTIONS) {
            this.ctx.send({
                embed: {
                    title: ":x: The reaction menu has stopped because I cannot add reactions in this channel.",
                    description: "Please contact the server moderators about this.",
                    color: Colors.ERROR,
                    footer: {
                        text: `Sosamba v${version}`
                    }
                }
            }).then(null, () => "");
        } else {
            this.ctx.send({
                embed: {
                    title: ":white_check_mark: Left the reaction menu successfully.",
                    description: "However, I cannot determine the reason why it stopped. If this is expected, feel free to do something else now. Else, contact the bot developers about this.",
                    color: Colors.SUCCESS,
                    footer: {
                        text: `Sosamba v${version}`
                    }
                }
            }).then(null, () => "");
        }
    }
}

module.exports = ReactionMenu;