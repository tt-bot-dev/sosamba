"use strict";
const { Colors, STOP_REASONS } = require("../../Constants");
const { version } = require("../../../package.json");
const ParsingError = require("../ParsingError");
const numbers = [":one:", ":two:", ":three:", ":four:", ":five:"];
const numbersUnicode = ["1\u20E3", "2\u20E3", "3\u20E3", "4\u20E3", "5\u20E3"];
const ReactionMenu = require("../../structures/ReactionMenu");
const ErisSerializers = module.exports = {};

class QueryReactionMenu extends ReactionMenu {
    constructor(ctx, msg, rs, rj, items, isUser, query, displayAs, filter, pro, isLast) {
        super(ctx, msg);
        this.rs = rs;
        this.rj = rj;
        this.items = items;
        for (const i in items) {
            this.callbacks[numbersUnicode[i]] = () => this.onItemChosen(i);
        }
        if (isUser) this.callbacks["🔄"] = () => this.refreshItems();
        this.displayAs = displayAs;
        this.query = query;
        this.predicate = filter;
        this.pro = pro;
        this.isLast = isLast;
        this.timeout = 5 * 6e4;
    }

    async refreshItems() {
        await this.ctx.send({
            embed: {
                title: ":arrows_counterclockwise: Refreshing the user list...",
                description: "This may take a while.",
                color: Colors.WARN,
            }
        });

        await this.sosamba.memberRequester.request(this.ctx.guild, this.query);
        await this.remove(false);
        await constructQuery(this.ctx, this.ctx.guild.members, this.predicate, this.query, this.displayAs, true, this.pro, this.isLast);
    }

    async onItemChosen(i) {
        this.rs(this.items[i]);
        await this.remove();
    }

    async remove(finished = true) {
        // Remove this menu automagically as we selected the item
        if (finished && this.sosamba.hasBotPermission(this.message.channel, "manageMessages")) await this.message.removeReactions();
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

    static _generateEmbed(items, displayAs, pro, isUser = false) {
        const fiveItems = items.slice(0, 5);
        const text = `${isUser ? "Cannot find the user you are looking for? Try mentioning them. | " : ""}Sosamba v${version}`;
        return {
            embed: {
                title: ":warning: Multiple items found!",
                description: `I have found ${items.length} items matching ${pro ? pro : "your query"}${items.length > 5 ? ", however, I'm only showing the first 5 of them in order to not clutter the chat" : ""}.
Please press the buttons according to what you want.
Here are the options:`,
                fields: [...fiveItems.map((c, i) => ({
                    name: `${numbers[i]}\u200B`,
                    value: displayAs(c)
                })),
                ...isUser && fiveItems !== 5 ? [{
                    name: ":arrows_counterclockwise:\u200B",
                    value: "Refresh"
                }] : [],
                {
                    name: ":stop_button:\u200B",
                    value: "Stop the search"
                }],
                color: Colors.WARN,
                footer: {
                    text
                }
            }
        };
    }
}

const constructQuery = (ctx, collection, predicate, itemName, displayAs, isUser = false, pro = "", isLast = false, triedToFetchMembers = false) => new Promise((rs, rj) => {
    const items = collection.filter(predicate(itemName));
    if (items.length === 0) {
        if (isUser && !triedToFetchMembers) {
            ctx.sosamba.memberRequester.request(ctx.guild, /^\d+$/.test(itemName) ? [itemName] : itemName).then(() => {
                rs(constructQuery(ctx, collection, predicate, itemName, displayAs, isUser, pro, isLast, true));
            });
            return;
        }
        const text = `${isUser ? "Cannot find the user you are looking for? Try mentioning them. | " : ""}Sosamba v${version}`;
        if (isLast) ctx.send({
            embed: {
                title: `:x: No items matching ${pro ? pro : "your query"} found.`,
                description: "Try making your query more specific.",
                color: Colors.ERROR,
                footer: {
                    text
                }
            }
        });
        rj(new ParsingError(`No items matching the query found: ${itemName}`, true));
    } else if (items.length === 1) {
        if (isUser && !(/^<@!?\d+>$/.test(itemName) || items[0].id === itemName) && !triedToFetchMembers) {
            const userInstance = items[0].user || items[0];
            ctx.send({
                embed: {
                    title: `:warning: ${pro ? pro[0].toUpperCase() : "Y"}${pro ? pro.slice(1) : "our query"} will be resolved to ${userInstance.username}#${userInstance.discriminator}`,
                    description: "Is that right? If so, please type `y` or `yes` within 10 seconds. If not, type `n` or `no` to fetch other members and try resolving your query again.",
                    color: Colors.WARN
                }
            }).then(() => ctx.askYesNo(true))
                .then(async response => {
                    if (!response.response && !response.context) {
                        rj(new ParsingError("Unsure whether I fetched the correct user or not, bailing out."));
                        return;
                    }
                    if (ctx.sosamba.hasBotPermission(ctx.channel, "manageMessages")) {
                        await response.context.msg.delete();
                    }
                    if (!response.response) {
                        await ctx.send({
                            embed: {
                                title: ":arrows_counterclockwise: Refreshing the user list...",
                                description: "This may take a while.",
                                color: Colors.WARN,
                            }
                        });

                        await ctx.sosamba.memberRequester.request(ctx.guild, itemName);
                        rs(constructQuery(ctx, ctx.guild.members, predicate, itemName, displayAs, true, pro, isLast, true));

                    } else {
                        rs(items[0]);
                    }
                }).catch(err => {
                    rj(new ParsingError("Cannot send confirmation query"));
                    console.error(err);
                });
        } else {
            rs(items[0]);
        }
    } else {
        ctx.send(QueryReactionMenu._generateEmbed(items, displayAs, pro, isUser)).then(m => {
            const menu = new QueryReactionMenu(ctx, m, rs, rj, items.slice(0, 5), isUser, itemName, displayAs, predicate, pro, isLast);
            return ctx.registerReactionMenu(menu);
        }).catch(err => {
            console.error(err);
            rj(new ParsingError("Cannot prepare reaction menu"));
        });
    }
});

ErisSerializers.member = async (val, ctx, arg) => {
    
    return constructQuery(ctx, ctx.guild.members, query => member => {
        if (member.id === query || `<@${member.id}>` === query || `<@!${member.id}>` === query) return true;
        else if (ctx.sosamba.options.allowUsernameLookup && (member.nick && (member.nick.toLowerCase().startsWith(query.toLowerCase()) ||
            member.nick.toLowerCase() === query.toLowerCase() || `${member.nick.toLowerCase()}#${member.discriminator}` === query.toLowerCase()))) return true;
        else if (ctx.sosamba.options.allowUsernameLookup && (member.user.username.toLowerCase() === query.toLowerCase() ||
            member.user.username.toLowerCase().startsWith(query.toLowerCase()) ||
            `${member.user.username.toLowerCase()}#${member.user.discriminator}` === query.toLowerCase())) return true;
        else return false;
    }, val, m => `${m.user.username}#${m.user.discriminator}`,
    true, arg.isFromArgParser ? `the specified \`${arg.name}\` argument` : arg.name, arg.isLast);
};

ErisSerializers.channel = (val, ctx, arg) => {
    return constructQuery(ctx, ctx.guild.channels, query => chan => {
        if (arg.textOnly && chan.type !== 0) return false;
        if (chan.id === query || `<#${chan.id}>` === query) return true;
        else if (chan.name.toLowerCase() === query.toLowerCase() ||
        chan.name.toLowerCase().startsWith(query.toLowerCase())) return true;
        else return false;
    }, val, c => {
        let t = "";
        if (c.type === 2) t += "Voice channel";
        if (c.type === 4) t += "Category";
        let str = `${t ? `${t} ` : ""}${c.name} (${c.id})`;
        if (c.type === 0) str += ` (${c.mention})`;
        return str;
    }, false, arg.isFromArgParser ? `the specified \`${arg.name}\` argument` : arg.name, arg.isLast);
};

ErisSerializers.user = (val, ctx, arg) => {
    return constructQuery(ctx, ctx.guild.members.map(m => m.user), query => user => {
        if (user.id === query || `<@${user.id}>` === query
            || `<@!${user.id}>` === query) return true;
        else if (ctx.sosamba.options.allowUsernameLookup && (user.username.toLowerCase() === query.toLowerCase() ||
            user.username.toLowerCase().startsWith(query.toLowerCase()) ||
            `${user.username.toLowerCase()}#${user.discriminator}` === query.toLowerCase())) return true;
        else return false;
    }, val, m => `${m.username}#${m.discriminator}`,
    true, arg.isFromArgParser ? `the specified \`${arg.name}\` argument` : arg.name, arg.isLast);
};

ErisSerializers.globalUser = (val, ctx, arg) => {
    return constructQuery(ctx, ctx.sosamba.users, query => user => {
        if (user.id === query || `<@${user.id}>` === query
            || `<@!${user.id}>` === query) return true;
        else if (ctx.sosamba.options.allowUsernameLookup && (user.username.toLowerCase() === query.toLowerCase() ||
            user.username.toLowerCase().startsWith(query.toLowerCase()) ||
            `${user.username.toLowerCase()}#${user.discriminator}` === query.toLowerCase())) return true;
        else return false;
    }, val, m => `${m.username}#${m.discriminator}`, true,
    arg.isFromArgParser ? `the specified \`${arg.name}\` argument` : arg.name, arg.isLast);
};

ErisSerializers.guild = (val, ctx, arg) => {
    return constructQuery(ctx, ctx.sosamba.guilds, query => guild => {
        if (guild.id === query || `<#${guild.id}>` === query) return true;
        else if (guild.name.toLowerCase() === query.toLowerCase() || guild.name.toLowerCase().startsWith(query.toLowerCase())) return true;
        else return false;
    }, val, g => `${g.name} (${g.id})`,
    false, arg.isFromArgParser ? `the specified \`${arg.name}\` argument` : arg.name, arg.isLast);
};

ErisSerializers.role = (val, ctx, arg) => {
    return constructQuery(ctx, ctx.guild.roles, query => role => {
        if (role.id === query || `<@&${role.id}>` === query) return true;
        else if (role.name.toLowerCase() === query.toLowerCase() ||
            role.name.toLowerCase().startsWith(query.toLowerCase())) return true;
        else return false;
    }, val, r => `${r.name} (${r.id}) ${r.mentionable ? `<@&${r.id}>` : ""}`,
    false, arg.isFromArgParser ? `the specified \`${arg.name}\` argument` : arg.name, arg.isLast);
};

ErisSerializers.constructQuery = constructQuery;
