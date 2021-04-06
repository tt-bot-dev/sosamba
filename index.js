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
const GlobalUser = require("./lib/structures/serializer/GlobalUser");
const Integer = require("./lib/structures/serializer/Integer");
const { constructQuery } = require("./lib/argParsers/switchSerializers/erisObjects");
const Structures = require("./lib/Structures");
const MessageListener = require("./lib/structures/MessageListener");
const LocaleFormatter = require("./lib/structures/LocaleFormatter");
const Locale = require("./lib/structures/Locale");
const Eris = require("eris");
const { Member, User, Guild, GuildChannel } = Eris;

const Serializers = {
    GlobalUser,
    Member,
    User,
    Guild,
    GuildChannel,
    Integer
};

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
    Serializers,
    constructQuery,
    Structures,
    MessageListener,
    LocaleFormatter,
    Locale,
    Eris,
};