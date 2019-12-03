"use strict";

const Constants = module.exports = {};
Constants.Colors = {
    ERROR: 0xFF0000,
    SUCCESS: 0x008800,
    WARN: 0xFFFF00
};
Constants.STOP_BUTTON = "⏹";
Constants.STOP_REASONS = {
    MANUAL: 0,
    MANUAL_EXIT: 0,
    TIMEOUT: 1,
    CANNOT_ADD_REACTIONS: 2,
    MESSAGE_DELETE: 3,
    SHUTDOWN: 4
};