"use strict";

const ReactionMenu = require("./ReactionMenu");
const { STOP_REASONS } = require("../Constants");
/**
 * A class that defines the command context. This is an extensible class
 * and may contains some other properties than the ones that are listed.
 * @memberof Sosamba
 */
class Context {
    /**
     * Construct a context
     * @param {Sosamba.Client} sosamba The client
     * @param {external:Message} msg The Eris message that has invoked a command
     */
    constructor(sosamba, msg) {
        /**
         * The client for this context
         * @type {Sosamba.Client}
         */
        this.sosamba = sosamba;
        /**
         * The {@link https://abal.moe/Eris/docs/Guild|guild} this command was invoked in
         * @type {external:Guild}
         */
        this.guild = msg.channel.guild;
        /**
         * The {@link https://abal.moe/Eris/docs/TextChannel|text channel} this command was invoked in
         * @type {external:TextChannel}
         */
        this.channel = msg.channel;
        /**
         * The user who invoked this command
         * @type {external:User}
         */
        this.author = msg.author;
        /**
         * The member who invoked this command
         * @type {external:Member}
         */
        this.member = msg.member;
        /**
         * The message that was sent
         * @type {external:Message}
         */
        this.message = msg;
        /**
         * The message that was sent
         * @type {external:Message}
         */
        this.msg = msg;
    }

    /**
     * Allows sending messages that are editable when the text is edited
     * @param {string|object} content See the parameter details at {@link https://abal.moe/Eris/docs/TextChannel#function-createMessage}
     * @param {object|object[]} [file] See the parameter details at {@link https://abal.moe/Eris/docs/TextChannel#function-createMessage}
     * @param {boolean} [doSet=true] Whether to make the message editable or not
     * @returns {Promise<external:Message>} The message that was sent
     */
    async send(content, file, doSet = true) {
        // Sorry for commiting a sin, but we create a new context each time, thus a context isn't the most permanent method of storing anything
        if (this.message._responseMsg && !this.message.dead && !this.message._responseMsg.dead) {
            if (file) {
                // Unfortunately
                await this.message._responseMsg.delete();
                const p = this.channel.createMessage(content, file);
                if (doSet) return this.message._responseMsg = await p;
                else return await p;
            } else {
                return await this.message._responseMsg.edit(content);
            }
        } else {
            const p = this.channel.createMessage(content, file);
            if (doSet) return this.message._responseMsg = await p;
            else return await p;
        }
    }

    /**
     * Registers a reaction menu
     * @param {Sosamba.ReactionMenu} menu The reaction menu
     */
    async registerReactionMenu(menu) {
        if (!(menu instanceof ReactionMenu)) throw new Error("The reaction menu is not an instance of the ReactionMenu class");
        try {
            await menu.prepareEmoji();
        } catch(e) {
            menu.stopCallback(STOP_REASONS.CANNOT_ADD_REACTIONS);
            return;
        }
        this.sosamba.reactionMenus.add(menu);
        if (menu.timeout) menu._timer = setTimeout(() => {
            menu.stopCallback(STOP_REASONS.TIMEOUT);
            this.sosamba.reactionMenus.remove(menu);
        }, menu.timeout);
    }

    /**
     * A helper method for the {@link Sosamba.MessageAwaiter#waitForMessage} function 
     * @param  {...any} args The arguments you would normally pass to the command; the context is already passed in.
     */
    async waitForMessage(...args) {
        return this.sosamba.messageAwaiter.waitForMessage(this, ...args);
    }

    
    /**
     * A helper method for the {@link Sosamba.MessageAwaiter#askYesNo} function 
     * @param  {...any} args The arguments you would normally pass to the command; the context is already passed in.
     */
    async askYesNo(...args) {
        return this.sosamba.messageAwaiter.askYesNo(this, ...args);
    }
}
module.exports = Context;