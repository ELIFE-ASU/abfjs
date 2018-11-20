const signale = require('signale');
const path = require('path');
const fs = require('fs-extra');

module.exports = function(filepath, verbosity=0) {
    if (verbosity) signale.start('Reading ABF file');

    let abf = {
        filepath: path.resolve(filepath),
        id: path.parse(filepath).name,
    };

    if (!fs.existsSync(abf.filepath)) {
        throw new Error(`ABF file does not exist: ${abf.filepath}`);
    }

    if (verbosity) {
        signale.info(`ID: ${abf.id}`);
        signale.info(`Filename: ${abf.filepath}`);
    }

    return abf;
};
