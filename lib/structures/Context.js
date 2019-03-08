"use strict";

const ReactionMenu = require("./ReactionMenu");
const { STOP_REASONS } = require("../Constants");
/**
 * A class that defines the command context. This is an extensible class
 * and may contains some other properties than the ones that are listed.
 */
class Context {
    /**
     * Construct a context
     * @param {SosambaClient} sosamba The client
     * @param {external:Message} msg The Eris message that has invoked a command
     */
    constructor(sosamba, msg) {
        /**
         * The client for this context
         * @type {SosambaClient}
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
    }

    /**
     * Allows sending messages that are editable when the text is edited
     * @param  {...any} args Anything that you'd normally pass to the {@link https://abal.moe/Eris/docs/TextChannel#function-createMessage|TextChannel.createMessage} function
     * @returns {Promise<external:Message>} The message that was sent
     */
    async send(content, file) {
        // Sorry for commiting a sin, but we create a new context each time, thus a context isn't the most permanent method of storing anything
        if (this.message._responseMsg && this.channel.messages.has(this.message._responseMsg.id)) {
            if (file) {
                // Unfortunately
                await this.message._responseMsg.delete();
                return this.message._responseMsg = await this.channel.createMessage(content, file);
            } else {
                return await this.message._responseMsg.edit(content);
            }
        } else {
            return this.message._responseMsg = await this.channel.createMessage(content, file);
        }
    }

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
}
module.exports = Context;