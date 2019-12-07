"use strict";
const { Console } = require("console");
const chalk = require("chalk");
class Logger extends Console {
    constructor({ ignoreErrors, level: allowedLevels, name }) {
        super({
            stdout: process.stdout,
            stderr: process.stderr,
            ignoreErrors
        });
        this.allowedLevels = ((Array.isArray(allowedLevels) && allowedLevels)
        || [process.env.NODE_ENV === "production" ? "" : "debug", "info", "log", "error", "warn"]).map(s => s.toLowerCase());
        this.name = name;
    }
    debug(...args) {
        if (!this.allowedLevels.includes("debug")) return;
        super.debug(chalk.grey(`${this.name} [DEBUG]`), ...args);
    }
    info(...args) {
        if (!this.allowedLevels.includes("info")) return;
        super.info(chalk.blueBright(`${this.name} [INFO]`), ...args);
    }
    log(...args) {
        if (!this.allowedLevels.includes("log")) return;
        super.log(chalk.grey(`${this.name} [LOG]`), ...args);
    }
    error(...args) {
        if (!this.allowedLevels.includes("error")) return;
        super.error(chalk.redBright(`${this.name} [ERROR]`), ...args);
    }
    warn(...args) {
        if (!this.allowedLevels.includes("warn")) return;
        super.error(chalk.yellowBright(`${this.name} [WARN]`), ...args);
    }
}
module.exports = Logger;