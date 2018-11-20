const signale = require('signale');
const path = require('path');
const fs = require('fs-extra');
const Sections = require('./src/sections');

const abf_file_format = function(data) {
    const fmt = data.toString('ascii', 0, 4);
    return (fmt === 'ABF ') ? 1 : (fmt === 'ABF2') ? 2 : 0;
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

    const data = fs.readFileSync(abf.filepath);

    abf.version = { major: abf_file_format(data) };
    if (abf.version.major === 0) {
        throw new Error('Invalid ABF file format');
    } else if (abf.version.major !== 2) {
        throw new Error(`Unsupported ABF file format: ${abf.version}`);
    }

    abf.sections = Sections(data);

    return abf;
};
