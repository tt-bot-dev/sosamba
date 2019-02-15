const Logger = require("../util/Logger");

/**
 * The base piece of Sosamba
 * @prop {SosambaClient} sosamba The client
 * @prop {string} file The file name
 * @prop {string} path The file path
 */
class SosambaBase {
    /**
     * 
     * @param {SosambaClient} sosamba The client
     * @param {string} fileName The file name
     * @param {string} filePath The file path
     * @param {string} id The internal identifier of a piece; can be overriden by member classes
     */
    constructor(sosamba, fileName = __filename, filePath = __dirname) {
        this.sosamba = sosamba;
        this.file = fileName;
        this.path = filePath;
        this.id = `${filePath}/${fileName}`;
        this.log = new Logger({
            stdout: [process.stdout, ...this.sosamba.options.log.stdout],
            stderr: [process.stderr, ...this.sosamba.options.log.stderr],
            level: this.sosamba.options.log.level ? this.sosamba.options.log.level : undefined,
            name: this.constructor.name
        });
    }

    /**
     * Mounts a piece; must be implemented by member classes.
     */
    mount() {
        throw new Error("Must be implemented by member classes");
    }

    /**
     * Unmounts a piece; must be implemented by member classes.
     */
    unmount() {
        throw new Error("Must be implemented by member classes");
    }
}

module.exports = SosambaBase;