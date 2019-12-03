"use strict";
const StreamArrayWritable = require("./logger/StreamArrayWritable");
const { Console } = require("console");
class Logger extends Console {
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
        this.allowedLevels = ((Array.isArray(allowedLevels) && allowedLevels) || ["debug", "info", "log", "error", "warn"]).map(s => s.toLowerCase());
        this.name = name;
    }
    debug(...args) {
        if (!this.allowedLevels.includes("debug")) return;
        super.debug(`${this.name} DEBUG:`, ...args);
    }
    info(...args) {
        if (!this.allowedLevels.includes("info")) return;
        super.info(`${this.name} INFO:`, ...args);
    }
    log(...args) {
        if (!this.allowedLevels.includes("log")) return;
        super.log(`${this.name} LOG:`, ...args);
    }
    error(...args) {
        if (!this.allowedLevels.includes("error")) return;
        super.error(`${this.name} ERROR:`, ...args);
    }
    warn(...args) {
        if (!this.allowedLevels.includes("warn")) return;
        super.error(`${this.name} WARN:`, ...args);
    }
}
module.exports = Logger;