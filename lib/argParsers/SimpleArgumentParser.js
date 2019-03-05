const ArgumentParser = require("../structures/ArgumentParser");

const quotes = ["'", '"'] // There are more, but these are the basic ones and are enough for now, TODO: add more quotes

/**
 * A simple argument parser that just splits the command text by spaces
 */
class SimpleArgumentParser extends ArgumentParser {
    constructor(sosamba, { filterEmptyArguments, allowQuotedString, separator }) {
        super(sosamba);
        this.allowQuotedString = allowQuotedString || false;
        // When quoted string parsing is allowed, empty args are always filtered
        this.filterEmptyArguments = allowQuotedString || filterEmptyArguments;
        this.separator = separator;
    }
    /**
     * Parses the arguments.
     * Quote parsing slightly modified from GAwesomeBot (https://github.com/GilbertGobbels/GAwesomeBot);
     * @param {string} content The content to parse
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
                    ss[pos] = "STRING_DELETE"; // There's no way to determine it other than that
                });
                return ss.filter(s => s !== "STRING_DELETE").join("");
            })
            return a.length === 1 && a[0] === "" ? [] : a.filter(arg => arg !== this.separator && arg !== " ");
        }
    }
}

module.exports = SimpleArgumentParser;