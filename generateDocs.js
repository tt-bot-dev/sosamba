"use strict";
let Docma;
try {
    Docma = require("docma");
} catch {
    // eslint-disable-next-line no-console
    console.error("Please install Docma.");
    process.exit(1);
}
const hrtime = process.hrtime();
Docma.create()
    .build(require(`${__dirname}/docma.json`))
    .then(() => {
        const [secs, nsecs] = process.hrtime(hrtime);
        // eslint-disable-next-line no-console
        console.log(`Documentation built in ${secs}s ${nsecs / 1e6}ms`);
    })
    .catch(console.error); // eslint-disable-line no-console