"use strict";
const ParsingError = require("../ParsingError");
const Serializers = module.exports = {};
Serializers.string = value => {
    return value;
};
Serializers.number = value => {
    const val = parseFloat(value);
    if (isNaN(val)) {
        throw new ParsingError("The argument is not a number");
    } else {
        return val;
    }
};

Serializers.int = value => {
    const val = parseInt(value);
    if (isNaN(val)) {
        throw new ParsingError("The argument is not an integer");
    } else {
        return val;
    }
};
Serializers.number64bit = value => {
    let val;
    try {
        val = BigInt(value);
    } catch {
        throw new ParsingError("The argument cannot be converted to a BigInt");
    }
    return val;
};

const trueValues = ["true", "yes", "y", "on", "1", "enable"];
const falseValues = ["false", "no", "n", "off", "0", "disable"];
Serializers.boolean = value => {
    if (trueValues.includes(value.toLowerCase())) {
        return true;
    } else if (falseValues.includes(value.toLowerCase())) {
        return false;
    } else {
        throw new ParsingError("The argument cannot be converted to a boolean");
    }
};

