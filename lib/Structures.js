"use strict";

const structs = {
    Context: require("./structures/Context"),
};

class Structures {
    constructor() {
        throw new Error("This class cannot be initialized as a class instance.");
    }

    static get(struct) {
        if (!struct) throw new Error("Missing structure name");
        if (typeof struct !== "string") throw new TypeError("The structure name must be a string");
        if (!Object.prototype.hasOwnProperty.call(structs, struct)) throw new Error(`${struct} is not an extendable class`);
        return structs[struct];
    }

    static extend(what, newClass) {
        const struct = structs[what];
        if (!struct) throw new Error(`${what} is not an extendable class`);
        if (typeof newClass !== "function") throw new Error("The extender must be a function");
        const cls = newClass(struct);
        if (typeof cls !== "function") throw new TypeError("The returned value must be the extended class/prototype");
        if (Object.getPrototypeOf(cls) !== struct) throw new TypeError("The returned class/prototype must extend the class you have requested.");
        structs[what] = cls;
    }
}

module.exports = Structures;
