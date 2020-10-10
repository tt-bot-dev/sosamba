"use strict";
class GuildMemberRequester {
    constructor(sosamba) {
        this.sosamba = sosamba;
        this.processing = new Map();
    }

    async request(guild, query, limit = 5) {
        const cacheKey = `${guild.id}:${this._getQueryKey(query)}`;
        if (this.processing.has(cacheKey)) {
            return this.processing.get(cacheKey);
        }
        const payload = {
            limit,
        };
        if (Array.isArray(query)) {
            payload.userIDs = query;
        } else {
            payload.query = query;
        }
        const promise = guild.fetchMembers(payload).then(members => {
            this.processing.delete(cacheKey);
            return members;
        });
        this.processing.set(cacheKey, promise);
        return promise;
    }

    _getQueryKey(query) {
        if (Array.isArray(query)) {
            return `user-${query.join("-")}`;
        } else {
            return query;
        }
    }
}

module.exports = GuildMemberRequester;
