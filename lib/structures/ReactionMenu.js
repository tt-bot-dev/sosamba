"use strict";
const { STOP_REASONS, Colors, STOP_BUTTON } = require("../Constants");
const { version } = require("../../package.json");
/**
 * A reaction menu. In order to implement a reaction menu, the developer
 * needs to implement this class.
 */
class ReactionMenu {
    /**
     * Construct a reaction menu
     * @param {Context} ctx The context
     * @param {external:Message} msg The message the end user must react to
     */
    constructor(ctx, msg) {
        /**
         * The client
         * @type {Client}
         */
        this.sosamba = ctx.sosamba;
        /**
         * The user who invoked the menu
         * @type {string}
         */
        this.user = ctx.author.id;
        /**
         * The callbacks for the menu
         * The object keys are the emojis and the values are functions with syntax of `(menu: {@see ReactionMenu}) => void | Promise<void>`
         * @type {object}
         */
        this.callbacks = {};
        /**
         * The context
         * @type {Context}
         */
        this.ctx = ctx;
        /**
         * The context
         * @type {Context}
         */
        this.context = this.ctx;
        /**
         * The message
         * @type {external:Message}
         */
        this.message = msg;
        /**
         * The message ID, used as a reaction menu ID
         * @type {string}
         */
        this.id = this.message.id;
        /**
         * The timeout for this menu. When false, the timeout is disabled.
         * When a number, the menu will time out after the specified time in milliseconds.
         * 
         * @type {number|boolean}
         */
        this.timeout = false;
    }

    /**
     * A check if the user can run the emoji callback
     * @param {string} emoji The emoji to check
     * @returns {boolean}
     */
    // eslint-disable-next-line no-unused-vars
    canRunCallback(emoji) {
        return true;
    }

    /**
     * Prepares the emoji to use with the reaction menu
     */
    async prepareEmoji() {
        if (!this.sosamba.hasBotPermission(this.ctx.channel, "addReactions")) {
            throw new Error("Cannot add reactions :(");
        }
        for (const emoji of [STOP_BUTTON, ...Object.keys(this.callbacks)]) await this.message.addReaction(emoji);
    }

    /**
     * A callback when the menu is stopped
     * @param {Constants.STOP_REASONS} reason The reason for stopping
     */
    async stopCallback(reason) {
        if (this.sosamba.hasBotPermission(this.message.channel, "manageMessages") && !this.message.dead) await this.message.removeReactions();
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
        } else if (reason === STOP_REASONS.MESSAGE_DELETE) {
            const m = await this.ctx.send({
                embed: {
                    title: ":x: The reaction menu has stopped because the command message was deleted.",
                    description: "This is an automatic measure implemented by Sosamba's developers. Please re-run the command again.",
                    color: Colors.ERROR,
                    footer: {
                        text: `This message deletes automatically in 10 seconds. | Sosamba v${version}`
                    }
                }
            }).catch(() => "");

            setTimeout(() => m.delete().then(null, () => ""), 1e4); // флек$
        } else if (reason === STOP_REASONS.SHUTDOWN) {
            this.ctx.send({
                embed: {
                    title: ":warning: The reaction menu has stopped because the bot is shutting down.",
                    description: "Please wait until the bot restarts.",
                    color: Colors.WARN,
                    footer: {
                        text: `Sosamba v${version}`
                    }
                }
            }).then(null, () => "");
        }
        else {
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