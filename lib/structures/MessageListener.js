"use strict";
/**
 * The MessageListener listens for incoming messages.
 * @example
 * const { MessageListener } = require("sosamba");
 * 
 * class MyMessageListener extends MessageListener {
 *      async run(ctx) {
 *          this.log.log(ctx.msg.content);
 *      }
 * }
 * 
 * module.exports = MyMessageListener;
 */
class MessageListener {
    /**
     * Construct a message listener
     * @param {Client} sosamba The client
     * @param {string} [name=this.constructor.name] The name of the listener
     * @param {boolean} [allowEdit=false] Controls whether this listener should run on edits
     */
    constructor(sosamba, name = this.constructor.name, allowEdit = false) {
        /**
         * The client
         * @type {Sosamba.Client}
         */
        this.sosamba = sosamba;

        /**
         * The name of the listener
         * @type {string}
         */
        this.name = name;

        /**
         * The name of the listener, also used as an ID
         * @type {string}
         */
        this.id = name;

        /**
         * Controls whether this listener should run on edits
         * @type {boolean}
         */
        this.allowEdit = allowEdit;
    }
    /**
     * The prerequisites the said message listener must complete
     * @param {Context} ctx The context of this message
     * @returns {boolean} If true, keep processing, if false, stop
     */
    prerequisites(ctx) { // eslint-disable-line no-unused-vars
        return true;
    }

    /**
     * This code processes the message, must be implemented by member classes.
     * @param {Context} ctx The context of this message
     */
    run(ctx) { // eslint-disable-line no-unused-vars
        throw new Error("This must be implemented by member classes");
    }
}

module.exports = MessageListener;