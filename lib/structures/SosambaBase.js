"use strict";
const Logger = require("../util/Logger");

class SosambaBase {
    constructor(sosamba, fileName = __filename, filePath = __dirname) {
        this.sosamba = sosamba;
        this.file = fileName;
        this.path = filePath;
        this.id = `${filePath}/${fileName}`;
        this.log = new Logger({
            level: (this.sosamba.options.log && this.sosamba.options.log.level) ? this.sosamba.options.log.level : undefined,
            name: this.constructor.name
        });
    }

    mount() {
        throw new Error("Must be implemented by member classes");
    }

    unmount() {
        throw new Error("Must be implemented by member classes");
    }
}

module.exports = SosambaBase;