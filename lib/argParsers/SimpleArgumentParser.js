const ArgumentParser = require("../structures/ArgumentParser");

/**
 * A simple argument parser that just splits the command text by spaces
 */
class SimpleArgumentParser extends ArgumentParser {
    constructor(sosamba, filterEmptyArguments) {
        super(sosamba);
        this.filterEmptyArguments = filterEmptyArguments;
    }
    parse(content) {
        let res = content.split(" ");
        if (this.filterEmptyArguments) res = res.filter(s => !!s);
        return res;
    }
}

module.exports = SimpleArgumentParser;