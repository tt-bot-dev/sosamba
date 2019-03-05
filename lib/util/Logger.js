"use strict";
const StreamArrayWritable = require("./logger/StreamArrayWritable");
const { Console } = require("console");

/**
 * @external Console
 * @see {@link https://nodejs.org/api/console.html#console_class_console}
 */

/**
 * A logging facility used by Sosamba
 * @extends {Console}
 */
class Logger extends Console {
    /**
     * The logger options
     * @typedef {object} LoggerOptions
     * @memberof Logger
     * @property {external:Writable[]} stdout An array of stdout outputs
     * @property {external:Writable[]} stderr An array of stderr outputs
     * @property {boolean} ignoreErrors Whether to ignore errors or not
     * @property {string[]} level The allowed levels for logging
     * @property {string} name The name of the logger
     */

    /**
     * Create a logger
     * @param {LoggerOptions} options The options used for the logger
     */
    constructor({ stdout, stderr, ignoreErrors, level: allowedLevels, name }) {
        super({
            stdout: new StreamArrayWritable({
                streams: stdout || [process.stdout],
            }),
            
            stderr: new StreamArrayWritable({
                streams: stderr || [process.stderr],
            }),
            ignoreErrors
        });
        this.allowedLevels = (allowedLevels || ["debug", "info", "log", "error", "warn"]).map(s => s.toLowerCase());
        this.name = name;
    }

    /**
     * Prints to the stdout with the debug type.
     * @param  {...any} args Anything to log
     */
    debug(...args) {
        if (!this.allowedLevels.includes("debug")) return;
        super.debug(`${this.name} DEBUG:`, ...args);
    }

    /**
     * Prints to the stdout with the info type.
     * @param  {...any} args Anything to log
     */
    info(...args) {
        if (!this.allowedLevels.includes("info")) return;
        super.info(`${this.name} INFO:`, ...args);
    }

    /**
     * Prints to the stdout with the log type.
     * @param  {...any} args Anything to log
     */
    log(...args) {
        if (!this.allowedLevels.includes("log")) return;
        super.log(`${this.name} LOG:`, ...args);
    }
    
    /**
     * Prints to the stderr with the error type.
     * @param  {...any} args Anything to log
     */
    error(...args) {
        if (!this.allowedLevels.includes("error")) return;
        super.error(`${this.name} ERROR:`, ...args);
    }
    
    /**
     * Prints to the stderr with the warn type.
     * @param  {...any} args Anything to log
     */
    warn(...args) {
        if (!this.allowedLevels.includes("warn")) return;
        super.error(`${this.name} WARN:`, ...args);
    }
}
module.exports = Logger;