"use strict";
const { promises } = require("fs");
const { join } = require("path");

module.exports = async function lookForFiles(path, collection, sosamba, classToCheck, internalClass) {
    let items;
    try {
        items = await promises.readdir(path, {
            withFileTypes: true
        });
    } catch {
        await promises.mkdir(path);
        items = [];
    }

    return Promise.all(items.map(async d => {
        const fullPath = join(path, d.name);
        if (d.isDirectory()) {
            sosamba.log.debug(`Hit a directory at ${fullPath}`);
            await lookForFiles(fullPath, collection, sosamba, classToCheck, internalClass);
        } else {
            let file;
            try {
                file = (await import(fullPath)).default;
            } catch (e) {
                sosamba.log.error(`Error loading the ${classToCheck.name.toLowerCase()} located at ${fullPath}:\n`, e);
                return e;
            }
            if (!(file.prototype instanceof classToCheck)) {
                sosamba.log.warn(`The ${classToCheck.name.toLowerCase()} located at ${fullPath} is not an instance of the ${classToCheck.name} class, ignoring.`);
                return new Error(`The ${classToCheck.name.toLowerCase()} is not an instance of the ${classToCheck.name} class.`);
            }

            const itemClass = new file(sosamba, d.name, path);
            itemClass.mount();
            const addedClass = collection.add(itemClass);

            if (itemClass !== addedClass) {
                // Replace internal handlers if any
                if (internalClass && addedClass instanceof internalClass) {
                    addedClass.unmount();
                    collection.add(itemClass);
                } else {
                    sosamba.log.error(`The ${classToCheck.name.toLowerCase()} class ${itemClass.constructor.name} at ${fullPath} uses the same ${classToCheck.name.toLowerCase()} name ${itemClass.id} and the class name that has been first loaded at ${join(addedClass.path, addedClass.file)}. In order to solve this, please use a different ${classToCheck.name.toLowerCase()} name.`);
                    itemClass.unmount();
                    return new Error(`The ${classToCheck.name.toLowerCase()} conflicts with another ${classToCheck.name.toLowerCase()}.`);
                }
            }

            sosamba.log.debug(`The ${classToCheck.name.toLowerCase()} located at ${fullPath} is loaded.`);
        }
    }));
};
