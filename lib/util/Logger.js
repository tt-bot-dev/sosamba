"use strict";
const { Console } = require("console");
const kleur = require("kleur");
const inspector = require("inspector");

// If inspector is attached, this will also log into the inspector console unless reassigned
class Logger extends Console {
    constructor({ ignoreErrors, level: allowedLevels, name }) {
        super({
            stdout: process.stdout,
            stderr: process.stderr,
            ignoreErrors
        });
        this.allowedLevels = (Array.isArray(allowedLevels) && allowedLevels
        || [process.env.NODE_ENV === "production" ? "" : "debug", "info", "log", "error", "warn"]).map(s => s.toLowerCase());
        this.name = name;
    }
    debug(...args) {
        if (inspector.url()) console.debug(`${this.name} [DEBUG] `, ...args);

        if (!this.allowedLevels.includes("debug")) return;
        super.debug(kleur.grey(`${this.name} [DEBUG]`), ...args);
    }
    info(...args) {
        if (inspector.url()) console.info(`${this.name} [INFO] `, ...args);

        if (!this.allowedLevels.includes("info")) return;
        super.info(kleur.blue(`${this.name} [INFO]`), ...args);
    }
    log(...args) {
        if (inspector.url()) console.log(`${this.name} [LOG] `, ...args);

        if (!this.allowedLevels.includes("log")) return;
        super.log(kleur.grey(`${this.name} [LOG]`), ...args);
    }
    error(...args) {
        if (inspector.url()) console.error(`${this.name} [ERROR] `, ...args);

        if (!this.allowedLevels.includes("error")) return;
        super.error(kleur.red(`${this.name} [ERROR]`), ...args);
    }
    warn(...args) {
        if (inspector.url()) console.warn(`${this.name} [WARN] `, ...args);

        if (!this.allowedLevels.includes("warn")) return;
        super.error(kleur.yellow(`${this.name} [WARN]`), ...args);
    }
}
module.exports = Logger;