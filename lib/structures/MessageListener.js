"use strict";

class MessageListener {
    constructor(sosamba, name = this.constructor.name, allowEdit = false) {

        this.sosamba = sosamba;

        this.name = name;

        this.id = name;

        this.allowEdit = allowEdit;
    }

    prerequisites(ctx) { // eslint-disable-line no-unused-vars
        return true;
    }

    run(ctx) { // eslint-disable-line no-unused-vars
        throw new Error("This must be implemented by member classes");
    }
}

module.exports = MessageListener;