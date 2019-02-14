const Base = require("./SosambaBase");
class Event extends Base {
    constructor(sosamba, fileName, filePath, {once, name}) {
        super(sosamba, fileName, filePath);
        this.evtName = name;
        this.once = once;
        // The constructor name and event name pair allows for multiple events to have same event names
        this.id = `${this.constructor.name}:${this.evtName}`
        this._listener = this._run.bind(this);
    }

    /**
     * The prerequisites the said event must complete
     * @param  {...any} args 
     */
    prerequisites(...args) {
        return true;
    }

    /**
     * This code processes the events; must be implemented by member classes
     * @param  {...any} args 
     */
    run(...args) {
        throw new Error("This must be implemented member classes")
    }
    async _run(...args) {
        try {
            if (!(await this.prerequisites(...args))) return;
            this.run(...args);
        } catch (e) {
            this.sosamba.emit("sosambaEventError", e);
        }
    }

    async _runOnce(...args) {
        await this._run(...args);
        this.sosamba.events.remove(this.id)
    }

    mount() {
        this.log.debug(`Event mounting`)
        this.sosamba.on(this.evtName, this._listener);
    }

    unmount() {
        this.log.debug(`Event unmounting`)
        this.sosamba.removeListener(this.evtName, this._listener);
    }
}

module.exports = Event;