"use strict";
/**
 * The constants used by Sosamba
 * @memberof Sosamba
 */
const Constants = module.exports = {};
/**
 * The colors used by Sosamba in the responses
 * @enum {number}
 */
Constants.Colors = {
    /**
     * Used by Sosamba when an error occurs
     */
    ERROR: 0xFF0000,
    /**
     * Indicates a success.
     */
    SUCCESS: 0x008800,
    /**
     * Indicates something that requires user's attention
     */
    WARN: 0xFFFF00
};

/**
 * The emoji that stops the reaction menu
 * @type {string}
 */
Constants.STOP_BUTTON = "⏹";

/**
 * The reasons for stopping a reaction menu
 * @enum {number}
 */
Constants.STOP_REASONS = {
    /**
     * Manual exit
     */
    MANUAL: 0,
    /**
     * Manual exit, left here for compatibility with tt.bot
     */
    MANUAL_EXIT: 0,

    /**
     * The menu timed out because of inactivity
     */
    TIMEOUT: 1,
    /**
     * The bot does not have permissions to add the reactions
     */
    CANNOT_ADD_REACTIONS: 2,
    /**
     * The message has been deleted
     */
    MESSAGE_DELETE: 3,
    /**
     * The bot is shutting down
     */
    SHUTDOWN: 4
};