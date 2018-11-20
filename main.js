const signale = require('signale');
const path = require('path');
const fs = require('fs-extra');
const Sections = require('./src/sections');

const interactive = new signale.Signale({ interactive: true });

const abf_file_format = function(data) {
    const fmt = data.toString('ascii', 0, 4);
    return (fmt === 'ABF ') ? 1 : (fmt === 'ABF2') ? 2 : 0;
};

const waiting = function(msg, verbosity, cb) {
    if (verbosity) interactive.await(msg);
    let result = cb();
    if (verbosity) interactive.complete(msg);
    return result;
};

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

    const data = waiting('Reading file into memory', verbosity, () =>
        fs.readFileSync(abf.filepath)
    );

    abf.version = { major: abf_file_format(data) };
    if (verbosity) signale.info(`File format: ${abf.version.major}`);

    if (abf.version.major === 0) {
        throw new Error('Invalid ABF file format');
    } else if (abf.version.major !== 2) {
        throw new Error(`Unsupported ABF file format: ${abf.version.major}`);
    }

    abf.sections = waiting('Reading sections', verbosity, () => Sections(data));

    return abf;
};
