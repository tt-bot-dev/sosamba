class ArgumentParser {
    constructor(sosamba) {
        this.sosamba = sosamba;
    }

    parse(content, ctx) {
        throw new Error(`Must be implemented by member classes`);
    }
}

module.exports = ArgumentParser;