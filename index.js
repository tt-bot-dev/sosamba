"use strict";
const Client = require("./lib/Client");
const Event = require("./lib/structures/Event");
const Logger = require("./lib/util/Logger");
const Command = require("./lib/structures/Command");
const ArgumentParser = require("./lib/structures/ArgumentParser");
const SimpleArgumentParser = require("./lib/argParsers/SimpleArgumentParser");
const SwitchArgumentParser = require("./lib/argParsers/SwitchArgumentParser");
const SerializedArgumentParser = require("./lib/argParsers/SerializedArgumentParser");
const ParsingError = require("./lib/argParsers/ParsingError");
const Constants = require("./lib/Constants");
const ReactionMenu = require("./lib/structures/ReactionMenu");
const GlobalUser = require("./lib/structures/GlobalUser");
const { constructQuery } = require("./lib/argParsers/switchSerializers/erisObjects");
const Structures = require("./lib/Structures");
const MessageListener = require("./lib/structures/MessageListener");
/**
 * A framework that simply doesn't сoсать anyone
 * @module Sosamba
 */
module.exports = {
    Client,
    Event,
    Logger,
    Command,
    ArgumentParser,
    SimpleArgumentParser,
    SwitchArgumentParser,
    SerializedArgumentParser,
    ParsingError,
    Constants,
    ReactionMenu,
    GlobalUser,
    constructQuery,
    Structures,
    MessageListener
};