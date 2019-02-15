const Client = require("./lib/Client");
const Event = require("./lib/structures/Event");
const Logger = require("./lib/util/Logger");
const Command = require("./lib/structures/Command");
const ArgumentParser = require("./lib/structures/ArgumentParser");
const SimpleArgumentParser = require("./lib/argParsers/SimpleArgumentParser");
module.exports = {
    Client,
    Event,
    Logger,
    Command,
    ArgumentParser
}