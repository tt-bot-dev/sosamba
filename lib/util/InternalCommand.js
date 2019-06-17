"use strict";
const Command = require("../structures/Command");

/**
 * A dummy command class for determining if the command is internal or not
 * @private
 * @extends {Sosamba.Command}
 */
class InternalCommand extends Command {}
module.exports = InternalCommand;