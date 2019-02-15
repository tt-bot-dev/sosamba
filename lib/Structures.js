/**
 * A sort of snide extendable structure handler
 */

const structs = {
    Context: require("./structures/Context"),
};

class Structures {
    constructor() {
        throw new Error("This class cannot be initialized as a class instance.");
    }

    /**
     * Gets a structure
     * @param {string} struct The structure name
     */
    static get(struct) {
        if (!struct) throw new Error(`Missing structure name`);
        if (typeof struct !== "string") throw new TypeError(`The structure name must be a string`);
        if (!structs.hasOwnProperty(struct)) throw new Error(`${struct} is not an extendable class`);
        return structs[struct];
    }

    /**
     * Extends a Sosamba built-in structure
     * @param {string} what The name of the structure you wish to extend
     * @param {Function} newClass A function that takes in the class you wish to extend and returns the extended class
     */
    static extend(what, newClass) {
        const struct = structs[what];
        if (!struct) throw new Error(`${what} is not an extendable class`);
        if (typeof newClass !== "function") throw new Error(`The extender must be a function`);
        // класс means class in English
        const класс = newClass(struct);
        if (typeof класс !== "function") throw new TypeError(`The returned value must be the extended class/prototype`);
        if (Object.getPrototypeOf(класс) !== struct) throw new TypeError(`The returned class/prototype must extend the class you have requested.`);
        structs[what] = класс;
    }
}

module.exports = Structures;