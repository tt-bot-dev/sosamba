"use strict";
const {Writable} = require("stream");

/**
 * A special writable stream used by Sosamba to write to multiple places.
 * @extends {external:Writable}
 * @memberof Sosamba
 */
class StreamArrayWritable extends Writable {

    /**
     * Options for the {@link StreamArrayWritable}
     * @typedef {object} StreamArrayWritableOptions
     * @memberof Sosamba.StreamArrayWritable
     * @property {external:Writable[]} streams The streams to write to
     */
    /**
     * Construct a StreamArrayWritable
     * @param {StreamArrayWritableOptions} options Options for the stream
     */
    constructor(options) {
        super(options);
        this.streams = options.streams;
    }

    _write(chunk, encoding, cb) {
        process.nextTick(() => {
            const promises = this.streams.map(s => new Promise((rs, rj) => {
                s._write(chunk, encoding, err => {
                    if (err) rj(err);
                    else rs();
                });
            }));
    
            Promise.all(promises).then(() => cb()).catch(err => cb(err));
        })
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
        process.nextTick(() => {
            const promises = this.streams.map(s => new Promise((rs, rj) => {
                s._destroy(err, err => {
                    if (err) rj(err);
                    else rs();
                });
            }));
    
            Promise.all(promises).then(() => cb()).catch(err => cb(err));
        })
    }

    _final(cb) {
        process.nextTick(() => {
            const promises = this.streams.map(s => new Promise((rs, rj) => {
                s._destroy(err => {
                    if (err) rj(err);
                    else rs();
                });
            }));
    
            Promise.all(promises).then(() => cb()).catch(err => cb(err));
        });
    }
}
module.exports = StreamArrayWritable;