"use strict";
const { User } = require("eris");
class GlobalUser extends User {
    static [Symbol.hasInstance](user) {
        return user instanceof User;
    }
}
module.exports = GlobalUser;
