const {Writable} = require("stream");

class StreamArrayWritable extends Writable {
    constructor(options) {
        super(options);
        this.streams = options.streams;
    }
    /**
     * This function MUST NOT be called by application code directly.
     * I don't even care
     */
    _write(chunk, encoding, cb) {
        const promises = this.streams.map(s => new Promise((rs, rj) => {
            s._write(chunk, encoding, err => {
                if (err) rj(err)
                else rs();
            })
        }))

        Promise.all(promises).then(() => cb()).catch(err => cb(err));
    }

    // This will be commented out because there are some shenanigans going on right now
    /*_writev(chunks, cb) {
        const promises = this.streams.map(s => new Promise((rs, rj) => {
            if (!s._writev) {
                const chunkPromises = chunks.map(c => new Promise((rs, rj) => {
                    this._write(c.chunk, c.encoding, err => {
                        if (err) rj(err);
                        else rs();
                    })
                }))
                // Here it is OK as rj will be called with the error
                Promise.all(chunkPromises).then(rs, rj);
                return;
            }
            console.log(chunks);
            s._writev(chunks, err => {
                if (err) rj(err)
                else rs();
            })
        }))

        Promise.all(promises).then(() => cb()).catch(err => cb(err));
    }*/

    _destroy(err, cb) {
        const promises = this.streams.map(s => new Promise((rs, rj) => {
            s._destroy(err, err => {
                if (err) rj(err)
                else rs();
            })
        }))

        Promise.all(promises).then(() => cb()).catch(err => cb(err));
    }

    _final(cb) {
        const promises = this.streams.map(s => new Promise((rs, rj) => {
            s._destroy(err => {
                if (err) rj(err)
                else rs();
            })
        }))

        Promise.all(promises).then(() => cb()).catch(err => cb(err));
    }
}
module.exports = StreamArrayWritable;