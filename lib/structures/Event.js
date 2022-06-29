"use strict";
const Base = require("./SosambaBase");
class Event extends Base {
    constructor(sosamba, fileName, filePath, { once, name }) {
        super(sosamba, fileName, filePath);
        this.evtName = name;
        this.once = once;
        this.id = `${this.constructor.name}:${this.evtName}`;
        this._listener = this[this.once ? "_runOnce" : "_run"].bind(this);
    }

    prerequisites(...args) { // eslint-disable-line no-unused-vars
        return true;
    }

    run(...args) { // eslint-disable-line no-unused-vars
        throw new Error("This must be implemented member classes");
    }

    async _run(...args) {
        try {
            if (!await this.prerequisites(...args)) return;
            this.run(...args);
        } catch (e) {
            this.sosamba.emit("sosambaEventError", e);
        }
    }

    async _runOnce(...args) {
        await this._run(...args);
        this.sosamba.events.remove(this);
    }

    mount() {
        this.log.debug("Event mounting");
        this.sosamba[this.once ? "once" : "on"](this.evtName, this._listener);
    }

    unmount() {
        this.log.debug("Event unmounting");
        this.sosamba.removeListener(this.evtName, this._listener);
    }
}

module.exports = Event;
