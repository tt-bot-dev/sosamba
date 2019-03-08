"use strict";
const Base = require("./SosambaBase");
const ParsingError = require("../argParsers/ParsingError");
/**
 * Represents an event from Discord
 * @memberof Sosamba
 * @extends SosambaBase
 * @example
 * const { Event } = require("sosamba");
 * 
 * class SomeEvent extends Event {
 *     constructor(...args) {
 *         super(...args, {
 *             once: false,
 *             name: "ready"
 *         });
 *     }
 * 
 *     run() {
 *         this.log.info(`${this.sosamba.user.username}#${this.sosamba.user.discriminator} is ready!`);
 *     }
 * }
 * module.exports = SomeEvent;
 */
class Event extends Base {
    /**
     * Represents event options
     * @typedef {object} EventOptions
     * @memberof Event
     * @property {boolean} once If this event triggers just once
     * @property {string} name The event name this event listens for
     */

    /**
     * Construct an event
     * @param {SosambaClient} sosamba The client
     * @param {string} fileName The file name
     * @param {string} filePath The file path
     * @param {EventOptions} options The options for an event
     */
    constructor(sosamba, fileName, filePath, {once, name}) {
        super(sosamba, fileName, filePath);
        /**
         * The event name this event is listening for
         * @type {string}
         */
        this.evtName = name;
        /**
         * If this event triggers just once; this event might be executed multiple times when reloaded.
         * @type {boolean}
         */
        this.once = once;

        /**
         * A special ID for events, is a pair of the class name and the event listener.
         * The constructor name and event name pair allows for multiple events to have same event names
         * @type {string}
         */
        this.id = `${this.constructor.name}:${this.evtName}`;
        /**
         * The listener used internally to mount and unmount the event
         * @type {Function}
         */
        this._listener = this[this.once ? "_runOnce" : "_run"].bind(this);
    }

    /**
     * The prerequisites the said event must complete
     * @param  {...any} args The arguments passed to the event; might not always be the same.
     * @returns {boolean} If true, proceed processing the event, if false, stop.
     */
    prerequisites(...args) { // eslint-disable-line no-unused-vars
        return true;
    }

    /**
     * This code processes the events; must be implemented by member classes
     * @param  {...any} args The arguments passed to the event; might not always be the same.
     */
    run(...args) { // eslint-disable-line no-unused-vars
        throw new Error("This must be implemented member classes");
    }

    /**
     * A compound function that allows running the event with more features.
     * @param  {...any} args The arguments passed to the event; might not always be the same.
     */
    async _run(...args) {
        try {
            if (!(await this.prerequisites(...args))) return;
            this.run(...args);
        } catch (e) {
            if (!(e instanceof ParsingError)) this.sosamba.emit("sosambaEventError", e); // Parsing errors are handled separately
        }
    }

    /**
     * A function that runs the event just once and removes it from the collection
     * for convenience.
     * @param  {...any} args The arguments passed to the event; might not always be the same.
     */
    async _runOnce(...args) {
        await this._run(...args);
        this.sosamba.events.remove(this.id);
    }

    /**
     * Mounts the event by adding a listener to the client.
     */
    mount() {
        this.log.debug("Event mounting");
        this.sosamba[this.once ? "once" : "on"](this.evtName, this._listener);
    }

    /**
     * Unmounts the event by removing a listener from the client.
     */
    unmount() {
        this.log.debug("Event unmounting");
        this.sosamba.removeListener(this.evtName, this._listener);
    }
}

module.exports = Event;