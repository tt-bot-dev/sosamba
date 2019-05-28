"use strict";
const { User } = require("eris");
/**
 * A special class that allows you to look up Discord users globally in the switches
 * @memberof Sosamba.Serializers
 */
class GlobalUser extends User {
    static [Symbol.hasInstance](user) {
        return user instanceof User;
    }
}
module.exports = GlobalUser;