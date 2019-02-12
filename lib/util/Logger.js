const StreamArrayWritable = require("./logger/StreamArrayWritable");

class Logger extends Console {
    constructor({ stdout, stderr, ignoreErrors }) {
        super({
            stdout: new StreamArrayWritable({
                streams: stdout,
            }),
            
            stderr: new StreamArrayWritable({
                streams: stderr,
            }),
            ignoreErrors
        })
    }
}
module.exports = Logger;