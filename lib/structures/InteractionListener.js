"use strict";

class InteractionListener {
    constructor(sosamba, name = this.constructor.name) {

        this.sosamba = sosamba;

        this.name = name;

        this.id = name;
    }

    prerequisites(ctx) { // eslint-disable-line no-unused-vars
        return true;
    }

    run(ctx) { // eslint-disable-line no-unused-vars
        throw new Error("This must be implemented by member classes");
    }
}

module.exports = InteractionListener;
