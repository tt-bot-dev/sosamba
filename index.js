"use strict";
const Client = require("./lib/Client");
const Event = require("./lib/structures/Event");
const Logger = require("./lib/util/Logger");
const Command = require("./lib/structures/Command");
const Constants = require("./lib/Constants");
const ReactionMenu = require("./lib/structures/ReactionMenu");
const Structures = require("./lib/Structures");
const MessageListener = require("./lib/structures/MessageListener");
const LocaleFormatter = require("./lib/structures/LocaleFormatter");
const Locale = require("./lib/structures/Locale");
const InteractionContext = require("./lib/structures/InteractionContext");
const InteractionListener = require("./lib/structures/InteractionListener");
const Dysnomia = require("@projectdysnomia/dysnomia");

module.exports = {
    Client,
    Event,
    Logger,
    Command,
    Constants,
    ReactionMenu,
    Structures,
    MessageListener,
    LocaleFormatter,
    Locale,
    InteractionContext,
    InteractionListener,
    Eris: Dysnomia, // [DEPRECATED]
    Dysnomia,
};
