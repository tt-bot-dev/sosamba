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
const { constructQuery } = require("./lib/argParsers/switchSerializers/erisObjects");
const Structures = require("./lib/Structures");
const MessageListener = require("./lib/structures/MessageListener");
const Eris = require("eris");
const {Member, User, Guild, GuildChannel} = Eris;

/**
 * An object containing all the serializable classes.
 * Some symbols are re-exported from Eris.
 * @memberof Sosamba
 */
const Serializers = {
    GlobalUser,
    /**
     * Re-exported Eris symbol
     */
    Member,
    
    /**
     * Re-exported Eris symbol
     */
    User,
    
    /**
     * Re-exported Eris symbol
     */
    Guild,
    
    /**
     * Re-exported Eris symbol
     */
    GuildChannel
};

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
    Serializers,
    constructQuery,
    Structures,
    MessageListener,

    /**
     * Re-exported Eris library for instanceof checks :eyes:
     */
    Eris,
};