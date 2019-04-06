"use strict";
const { Colors, STOP_REASONS } = require("../../Constants");
const { version } = require("../../../package.json");
const ParsingError = require("../ParsingError");
const numbers = [":one:", ":two:", ":three:", ":four:", ":five:"];
const numbersUnicode = ["1\u20E3", "2\u20E3", "3\u20E3", "4\u20E3", "5\u20E3"];
const ReactionMenu = require("../../structures/ReactionMenu");
const ErisSerializers = module.exports = {};

/**
 * The query reaction menu
 * @private
 */
class QueryReactionMenu extends ReactionMenu {
    /**
     * Construct a query reaction menu
     * @private
     */
    constructor(ctx, msg, rs, rj, items) {
        super(ctx, msg);
        this.rs = rs;
        this.rj = rj;
        this.items = items;
        for (const i in items) {
            this.callbacks[numbersUnicode[i]] = () => this.onItemChosen(i);
        }
        this.timeout = 5*6e4;
    }

    async onItemChosen(i) {
        this.rs(this.items[i]);
        // Remove this menu automagically as we selected the item 
        if (this.sosamba.hasBotPermission(this.message.channel, "manageMessages")) await this.message.removeReactions();
        this.sosamba.reactionMenus.remove(this);
    }
    async stopCallback(reason) {
        if (reason === STOP_REASONS.MANUAL || reason === STOP_REASONS.TIMEOUT) {
            if (this.sosamba.hasBotPermission(this.message.channel, "manageMessages")) await this.message.removeReactions();
            this.rj(new ParsingError("User stopped the menu", true));
        } else {
            super.stopCallback(reason);
        }
    }
}

/**
 * Builds a query
 * @memberof Sosamba
 * @param {Context} ctx The context
 * @param {Collection<T>|T[]} collection The collection of the items
 * @param {Function} predicate The function that accepts an argument with user's query and returns the filtering predicate
 * @param {string} itemName The user's query
 * @param {Function} displayAs The function that accepts an argument with the item and returns a string that best describes the item
 * @param {boolean} [isUser=false] Whether the item we are looking for is an user (used only internally)
 * @returns {T}
 */
const constructQuery = (ctx, collection, predicate, itemName, displayAs, isUser = false) => new Promise((rs, rj) => {
    const items = collection.filter(predicate(itemName));
    const text = `${isUser ? "Cannot find the user you are looking for? Try mentioning them. | ": ""}Sosamba v${version}`;
    if (items.length === 0) {
        ctx.send({
            embed: {
                title: ":x: No items matching your query found.",
                description: "Try making your query more specific.",
                color: Colors.ERROR,
                footer: {
                    text
                }
            }
        });
        rj(new ParsingError(`No items matching the query found: ${itemName}`, true));
    } else if (items.length === 1) rs(items[0]);
    else {
        const fiveItems = items.slice(0, 5);
        ctx.send({
            embed: {
                title: ":warning: Multiple items found!",
                description: `I have found ${items.length} items matching your query${items.length > 5 ? ", however, I'm only showing the first 5 of them in order to not clutter the chat": ""}.
Please press the buttons according to what you want.
Here are the options:`,
                fields: [...fiveItems.map((c, i) => ({
                    name: numbers[i],
                    value: displayAs(c)
                })), {
                    name: ":stop_button:",
                    value: "Stop the search"
                }],
                color: Colors.WARN,
                footer: {
                    text
                }
            }
        }).then(m => {
            const menu = new QueryReactionMenu(ctx, m, rs, rj, fiveItems);
            return ctx.registerReactionMenu(menu);
        }).catch(() => {
            rj(new ParsingError("Something else happened", true));
        });
    }
});

ErisSerializers.member = (val, ctx) => {
    return constructQuery(ctx, ctx.guild.members, query => fn => {
        let nick = fn.nick ? fn.nick : fn.username;
        if (fn.username == query || fn.id == query || `<@${fn.id}>` == query || `<@!${fn.id}>` == query || `${fn.username}#${fn.discriminator}` == query || fn.username.startsWith(query)) return true;
        else if (nick.startsWith(query) || nick == query || `${nick}#${fn.discriminator}` == query) return true;
        else if (nick.toLowerCase().startsWith(query.toLowerCase()) || nick.toLowerCase() == query.toLowerCase() || `${nick.toLowerCase()}#${fn.discriminator}` == query.toLowerCase()) return true;
        else if (fn.username.toLowerCase() == query.toLowerCase() || fn.username.toLowerCase().startsWith(query.toLowerCase()) || `${fn.username.toLowerCase()}#${fn.discriminator}` == query.toLowerCase()) return true;
        else return false;
    }, val, m => `${m.username}#${m.discriminator}`, true);
};

ErisSerializers.channel = (val, ctx) => {
    return constructQuery(ctx, ctx.guild.channels, query => fn => {
        // saving all users in an array where it finds these formats
        // username, id, mention (<@!id> or <@id>), nickname, username#1234 or nickname#1234 - case insensitive
        if (fn.name == query || fn.id == query || `<#${fn.id}>` == query || fn.name.startsWith(query)) return true;
        else if (fn.name.toLowerCase() == query.toLowerCase() || fn.name.toLowerCase().startsWith(query.toLowerCase())) return true;
        else return false; // we ignore other users
    }, val, c => {
        let t = "";
        if (c.type == 2) t += "Voice channel";
        if (c.type == 4) t += "Category";
        let str = `${t? `${t} `: ""}${c.name} (${c.id})`;
        if (c.type == 0) str += ` (${c.mention})`;
        return str;
    });
};

ErisSerializers.user = (val, ctx) => {
    return constructQuery(ctx, ctx.guild.members.map(m => m.user), query => fn => {
        if (fn.username == query || fn.id == query || `<@${fn.id}>` == query || `<@!${fn.id}>` == query || `${fn.username}#${fn.discriminator}` == query || fn.username.startsWith(query)) return true;
        else if (fn.username.toLowerCase() == query.toLowerCase() || fn.username.toLowerCase().startsWith(query.toLowerCase()) || `${fn.username.toLowerCase()}#${fn.discriminator}` == query.toLowerCase()) return true;
        else return false;
    }, val, m => `${m.username}#${m.discriminator}`, true);
};

ErisSerializers.globalUser = (val, ctx) => {
    return constructQuery(ctx, ctx.sosamba.users, query => fn => {
        if (fn.username == query || fn.id == query || `<@${fn.id}>` == query || `<@!${fn.id}>` == query || `${fn.username}#${fn.discriminator}` == query || fn.username.startsWith(query)) return true;
        else if (fn.username.toLowerCase() == query.toLowerCase() || fn.username.toLowerCase().startsWith(query.toLowerCase()) || `${fn.username.toLowerCase()}#${fn.discriminator}` == query.toLowerCase()) return true;
        else return false;
    }, val, m => `${m.username}#${m.discriminator}`, true);
};

ErisSerializers.guild = (val, ctx) => {
    return constructQuery(ctx, ctx.sosamba.guilds, query => fn => {
        if (fn.name == query || fn.id == query || `<#${fn.id}>` == query || fn.name.startsWith(query)) return true;
        else if (fn.name.toLowerCase() == query.toLowerCase() || fn.name.toLowerCase().startsWith(query.toLowerCase())) return true;
        else return false;
    }, val, (g) => `${g.name} (${g.id})`);
};

ErisSerializers.constructQuery = constructQuery;