"use strict";
const { User } = require("@projectdysnomia/dysnomia");
class GlobalUser extends User {
    static [Symbol.hasInstance](user) {
        return user instanceof User;
    }
}
module.exports = GlobalUser;
