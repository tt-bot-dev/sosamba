"use strict";
const Logger = require("../util/Logger");

/**
 * The base class of Sosamba
 * @prop {SosambaClient} sosamba The client
 * @prop {string} file The file name
 * @prop {string} path The file path
 */
class SosambaBase {
    /**
     * Construct the base class
     * @param {SosambaClient} sosamba The client
     * @param {string} fileName The file name
     * @param {string} filePath The file path
     */
    constructor(sosamba, fileName = __filename, filePath = __dirname) {
        /**
         * The client
         * @type {SosambaClient}
         */
        this.sosamba = sosamba;
        /**
         * The file name of the class
         * @type {string}
         */
        this.file = fileName;
        /**
         * The path to the file without the filename
         * @type {string}
         */
        this.path = filePath;
        /**
         * The identifier of a class (overridable by member classes)
         */
        this.id = `${filePath}/${fileName}`;

        /**
         * The logger for the class
         * @type {Logger}
         */
        this.log = new Logger({
            stdout: [process.stdout, ...(this.sosamba.options.log.stdout || [])],
            stderr: [process.stderr, ...(this.sosamba.options.log.stderr || [])],
            level: this.sosamba.options.log.level ? this.sosamba.options.log.level : undefined,
            name: this.constructor.name
        });
    }

    /**
     * Mounts the class; must be implemented by member classes.
     * @returns {void}
     */
    mount() {
        throw new Error("Must be implemented by member classes");
    }

    /**
     * Unmounts the class; must be implemented by member classes.
     * @returns {void}
     */
    unmount() {
        throw new Error("Must be implemented by member classes");
    }
}

module.exports = SosambaBase;