"use strict";
const ArgumentParser = require("../structures/ArgumentParser");
const SymbolDelete = Symbol("STRING_DELETE");
const quotes = ["'", "\""]; // There are more, but these are the basic ones and are enough for now, TODO: add more quotes

/**
 * A simple argument parser that just splits the command text by spaces
 * @extends {Sosamba.ArgumentParser}
 * @memberof Sosamba
 */
class SimpleArgumentParser extends ArgumentParser {
    /**
     * The options for the SimpleArgumentParser
     * @typedef {object} SimpleArgumentParserOptions
     * @memberof Sosamba.SimpleArgumentParser
     * @property {boolean} [filterEmptyArguments=false] Whether to filter empty arguments. When the quoted parsing is used, this is always true
     * @property {boolean} [allowQuotedString=false] Whether to use quoted parsing or not
     * @property {string} [separator=" "] The separator for the parser
     */
    /**
     * Creates a SimpleArgumentParser
     * @param {Client} sosamba The client
     * @param {SimpleArgumentParserOptions} options The options for the parser 
     */
    constructor(sosamba, { filterEmptyArguments, allowQuotedString, separator }) {
        super(sosamba);
        /**
         * Whether to use quoted parsing or not
         * @type {boolean}
         */
        this.allowQuotedString = allowQuotedString || false;
        /**
         * Whether to filter empty arguments or not.
         * When the quoted parsing is used, this is always true
         * @type {boolean}
         */
        this.filterEmptyArguments = allowQuotedString || filterEmptyArguments;
        /**
         * The separator for the parser
         * @type {string}
         */
        this.separator = separator;
    }
    /**
     * Parses the arguments.
     * Quote parsing slightly modified from {@link https://github.com/GilbertGobbels/GAwesomeBot|GAwesomeBot}
     * @param {string} content The content to parse
     * @returns {string[]} The parsed content
     */
    parse(content) {
        if (!this.allowQuotedString) {
            let res = content.split(this.separator || " ");
            if (this.filterEmptyArguments) res = res.filter(s => !!s);
            return res;
        } else {
            if (!this.separator || this.separator === "") return [content];
            const args = [];
            let cur = "";
            let open = false;
            // storage for quote backslashes position so we can remove them later
            const quotedBackslashes = new Map();
            for (let i = 0; i < content.length; i++) {
                if (!open && content.slice(i, i + this.separator.length) === this.separator){
                    if (cur !== "") args.push(cur);
                    cur = "";
                    i += this.separator.length - 1;
                    continue;
                }
                if (quotes.find(s => s === content[i])) {
                    if (content[i - 1] === "\\") { // Escaped quote, place in the normal quote instead of the \" pair
                        if (!quotedBackslashes.has(args.length)) {
                            quotedBackslashes.set(args.length, []);
                        }
                        const b = quotedBackslashes.get(args.length);
                        b.push(cur.length - 1);
                        cur += content[i];
                        continue;
                    } else {
                        if ((open && content[i] === content[i - cur.length - 1]) || !open) { // if there is a new quote or the quote is the same
                            open = !open;
                            if (cur !== "") args.push(cur);
                            cur = "";
                            continue;
                        }
                    }
                }
                cur += content[i];
            }
            if (cur !== "") args.push(cur);
            const a = args.map((s, i) => {
                const backslashes = quotedBackslashes.get(i);
                if (!backslashes) return s;
                const ss = s.split("");
                backslashes.forEach(pos => {
                    ss[pos] = SymbolDelete; // There's no way to determine it other than that
                });
                return ss.filter(s => s !== SymbolDelete).join("");
            });
            return a.length === 1 && a[0] === "" ? [] : a.filter(arg => arg !== this.separator && arg !== " ");
        }
    }
}

module.exports = SimpleArgumentParser;