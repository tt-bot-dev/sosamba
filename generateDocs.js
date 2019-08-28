"use strict";
/* eslint-disable no-console */
let Docma;
try {
    Docma = require("docma");
} catch {
    console.error("Please install Docma.");
    process.exit(1);
}
const hrtime = process.hrtime();
Docma.create()
    .build(require(`${__dirname}/docma.json`))
    .then(() => {
        const [secs, nsecs] = process.hrtime(hrtime);
        console.log(`Documentation built in ${secs}s ${nsecs / 1e6}ms`);
    })
    .catch(console.error);