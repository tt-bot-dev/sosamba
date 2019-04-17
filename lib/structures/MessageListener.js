"use strict";
/**
 * The MessageListener listens for incoming messages. 
 * @memberof Sosamba
 * @extends Sosamba.SosambaBase
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
     * @param {Sosamba.Client} sosamba The client
     * @param {string} [name=this.constructor.name] The name of the listener
     */
    constructor(sosamba, name = this.constructor.name) {
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
    }
    /**
     * The prerequisites the said message listener must complete
     * @param {Sosamba.Context} ctx The context of this message
     * @returns {boolean} If true, keep processing, if false, stop
     */
    prerequisites(ctx) { // eslint-disable-line no-unused-vars
        return true;
    }

    /**
     * This code processes the message, must be implemented by member classes.
     * @param {Sosamba.Context} ctx The context of this message
     */
    run(ctx) { // eslint-disable-line no-unused-vars
        throw new Error("This must be implemented by member classes");
    }
}

module.exports = MessageListener;