const Base = require("../SosambaBase");
class Event extends Base {
    constructor(sosamba, fileName, filePath, options) {
        super(sosamba, fileName, filePath);
        this.evtName = name || fileName;
        this.once = once;
    }
}

module.exports = Event;