const signale = require('signale');
const path = require('path');
const fs = require('fs-extra');
const Sections = require('./src/sections');

const BLOCK_SIZE = 512;

const interactive = new signale.Signale({ interactive: true });

const waiting = function(msg, verbosity, cb) {
    if (verbosity) {
        var start = process.hrtime();
        interactive.await(msg);
    }

    let result = cb();

    if (verbosity) {
        let stop = process.hrtime(start);
        interactive.complete(`${msg} (${stop[0]}s ${stop[1]/1000000}ms)`);
    }
    return result;
};

const abf_file_format = function(data) {
    const fmt = data.toString('ascii', 0, 4);
    return (fmt === 'ABF ') ? 1 : (fmt === 'ABF2') ? 2 : 0;
};

const load_variables = function(abf) {
    let { header, section_map, protocol, adc } = abf.sections;


    abf.data_format = header.data_format;

    switch (abf.data_format) {
    case 0:
        abf.dtype = 'int';
        break;
    case 1:
        abf.dtype = 'float';
        break;
    default:
        throw new Error(`Unsupported data format: ${abf.data_format}`);
    }

    abf.channel_count = section_map.adc_section[2];

    abf.data_byte_start = section_map.data_section[0] * BLOCK_SIZE;
    abf.data_point_byte_size = section_map.data_section[1];
    abf.data_point_count = section_map.data_section[2];

    abf.data_gain = new Array(abf.channel_count);
    abf.data_offset = new Array(abf.channel_count);

    const k = protocol.adc_range / protocol.adc_resolution;
    for (let i = 0; i < abf.channel_count; ++i) {
        abf.data_gain[i] = k;
        abf.data_gain[i] /= adc.instrument_scale_factor[i];
        abf.data_gain[i] /= adc.signal_gain[i];
        abf.data_gain[i] /= adc.adc_programmable_gain[i];
        if (adc.telegraph_enable[i] == 1) {
            abf.data_gain[i] /= adc.telegraph_addit_gain[i];
        }

        abf.data_offset[i] = adc.instrument_offset[i] - adc.signal_offset[i];
    }

    abf.data_rate = 1e6 / protocol.adc_sequence_interval;

    abf.sweep_count = header.actual_episodes;
    if (abf.sweep_count === 0) {
        abf.sweep_count = 1;
    }
    abf.sweep_point_count = abf.data_point_count / (abf.sweep_count * abf.channel_count);
    abf.sweep_length_time = abf.sweep_point_count / abf.data_rate;
};

const load_data = function(abf, buffer) {
    const { dtype, channel_count, data_byte_start, data_point_byte_size, data_point_count } = abf;

    const nrows = channel_count;
    const ncols = Math.round(data_point_count / nrows);

    const reader =
        (dtype === 'int') ? 'readInt16LE' :
            (dtype === 'float') ? 'readFloatLE' : 
                undefined;

    if (reader === undefined) {
        throw new Error(`Unsupported dtype: '${dtype}'`);
    }

    let offset = data_byte_start;

    let data = new Array(nrows);
    for (let i = 0; i < nrows; ++i) data[i] = new Array(ncols);

    for (let j = 0; j < ncols; ++j) {
        for (let i = 0; i < nrows; ++i, offset += data_point_byte_size) {
            data[i][j] = buffer[reader](offset);
        }
    }

    abf.data = { data, nrows, ncols };
};

const scale_data = function(abf) {
    const { dtype, data_gain, data_offset } = abf;
    if (dtype === 'int') {
        const { data, nrows, ncols } = abf.data;
        for (let i = 0; i < nrows; ++i) {
            for (let j = 0; j < ncols; ++j) {
                data[i][j] = data[i][j] * data_gain[i] + data_offset[i];
            }
        }
    }
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

    load_variables(abf);

    waiting('Loading data', verbosity, () => load_data(abf, data));
    waiting('Scaling data', verbosity, () => scale_data(abf));

    return abf;
};
