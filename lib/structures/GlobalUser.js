const { User } = require("eris");
/**
 * A special class that allows you to look up Discord users globally in the switches
 */
class GlobalUser extends User {};
module.exports = GlobalUser;