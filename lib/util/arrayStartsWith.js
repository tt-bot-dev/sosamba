"use strict";
module.exports = function arrayStartsWith(content, str, returnString) {
    const cont = content.toLowerCase();
    if (typeof str === "string") {
        const starts = cont.startsWith(str.toLowerCase());
        return returnString ? starts && str : starts;
    } 
    for (const p of str) {
        if (cont.startsWith(p.toLowerCase())) return returnString ? p : true;
    }
    return false;
};
