const signale = require('signale');
const path = require('path');
const fs = require('fs');
const Sections = require('./src/sections');

const BLOCK_SIZE = 512;

const waiting = function(msg, verbosity, cb) {
    if (verbosity) {
        var start = process.hrtime();
        signale.await(msg);
    }

    let result = cb();

    if (verbosity) {
        let stop = process.hrtime(start);
        signale.complete(`${msg} (${stop[0]}s ${stop[1]/1000000}ms)`);
    }
    return result;
};

const ABFPrototype = {
    abf_file_format: function(data) {
        const fmt = data.toString('ascii', 0, 4);
        return (fmt === 'ABF ') ? 1 : (fmt === 'ABF2') ? 2 : 0;
    },

    get_version: function(data) {
        this.version = { major: this.abf_file_format(data) };
    },

    load_sections: function(data) {
        this.sections = Sections(data);
    },

    load_variables: function() {
        let { header, section_map, protocol, adc, indexed_strings } = this.sections;

        this.data_format = header.data_format;

        switch (this.data_format) {
        case 0:
            this.dtype = 'int';
            break;
        case 1:
            this.dtype = 'float';
            break;
        default:
            throw new Error(`Unsupported data format: ${this.data_format}`);
        }

        this.channel_count = section_map.adc_section[2];

        this.data_byte_start = section_map.data_section[0] * BLOCK_SIZE;
        this.data_point_byte_size = section_map.data_section[1];
        this.data_point_count = section_map.data_section[2];

        this.data_gain = new Array(this.channel_count);
        this.data_offset = new Array(this.channel_count);

        const k = protocol.adc_range / protocol.adc_resolution;
        for (let i = 0; i < this.channel_count; ++i) {
            this.data_gain[i] = k;
            this.data_gain[i] /= adc.instrument_scale_factor[i];
            this.data_gain[i] /= adc.signal_gain[i];
            this.data_gain[i] /= adc.adc_programmable_gain[i];
            if (adc.telegraph_enable[i] == 1) {
                this.data_gain[i] /= adc.telegraph_addit_gain[i];
            }

            this.data_offset[i] = adc.instrument_offset[i] - adc.signal_offset[i];
        }

        this.data_rate = 1e6 / protocol.adc_sequence_interval;
        this.data_sec_per_point = 1.0 / this.data_rate;
        this.data_point_per_ms = Math.round(1e-3 * this.data_rate);

        this.sweep_count = header.actual_episodes;
        if (this.sweep_count === 0) {
            this.sweep_count = 1;
        }
        this.sweep_point_count = this.data_point_count / (this.sweep_count * this.channel_count);
        this.sweep_length_time = this.sweep_point_count / this.data_rate;

        this.adc_units = indexed_strings.adc.channel_units.slice(0, this.channel_count);
        this.adc_names = indexed_strings.adc.channel_names.slice(0, this.channel_count);
        this.dac_units = indexed_strings.dac.channel_units.slice(0, this.channel_count);
        this.dac_names = indexed_strings.dac.channel_names.slice(0, this.channel_count);

        this.x_labels = new Array(this.channel_count);
        this.y_labels = new Array(this.channel_count);
        this.c_labels = new Array(this.channel_count);
        for (let i = 0; i < this.channel_count; ++i) {
            this.x_labels[i] = `time (sec)`;
            if (this.adc_units[i] === 'pA') {
                this.sweep_label_y = 'Clamp Current (pA)';
                this.sweep_label_c = 'Membrane Potential (mV)';
            } else if (this.adc_units[i] === 'mV') {
                this.sweep_label_y = 'Membrane Potential (mV)';
                this.sweep_label_c = 'Applied Current (pV)';
            } else {
                this.y_labels[i] = `${this.adc_names[i]} (${this.adc_units[i]})`;
                this.c_labels[i] = `${this.dac_names[i]} (${this.dac_names[i]})`;
            }
        }
    },

    load_data: function(buffer) {
        const { dtype, channel_count } = this;
        const { data_byte_start, data_point_byte_size, data_point_count } = this;

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

        this.channel_data = new Array(nrows);
        for (let i = 0; i < nrows; ++i) this.channel_data[i] = new Array(ncols);

        for (let j = 0; j < ncols; ++j) {
            for (let i = 0; i < nrows; ++i, offset += data_point_byte_size) {
                this.channel_data[i][j] = buffer[reader](offset);
            }
        }

        this.sample_times = new Array(nrows);
        for (let i = 0; i < nrows; ++i) {
            this.sample_times[i] = new Array(ncols);
            for (let j = 0; j < ncols; ++j) {
                this.sample_times[i][j] = j * this.data_sec_per_point;
            }
        }
    },

    scale_data: function() {
        const { dtype, data_gain, data_offset, channel_data } = this;

        if (dtype === 'int') {
            for (let i = 0, nrows = channel_data.length; i < nrows; ++i) {
                for (let j = 0, ncols = channel_data[i].length; j < ncols; ++j) {
                    channel_data[i][j] = channel_data[i][j] * data_gain[i] + data_offset[i];
                }
            }
        }
    },

    set_sweep: function(sweep_number = -1, channel = 0) {
        if (sweep_number < -1 || sweep_number > this.sweep_count) {
            const msg = `Invalid sweep ${sweep_number} (must be -1 to ${this.sweep_count - 1})`;
            throw new Error(msg);
        }
        if (channel < 0 || channel > this.channel_count) {
            const msg = `Invalid channel ${channel} (must be 0 to ${this.channel_count - 1})`;
            throw new Error(msg);
        }

        if (this.sweep_number !== sweep_number) {
            this.sweep_number = sweep_number;
            this.sweep_channel = channel;
            this.sweep_units_x = 'sec';
            this.sweep_units_y = this.adc_units[channel];
            this.sweep_units_c = this.dac_units[channel];

            this.sweep_x_label = this.x_labels[channel];
            this.sweep_y_label = this.y_labels[channel];
            this.sweep_c_label = this.c_labels[channel];

            if (sweep_number === -1) {
                this.sweep_y = this.channel_data[channel].slice();
                this.sweep_x = this.sample_times[channel].slice();
            } else {
                const point_start = this.sweep_point_count * sweep_number;
                const point_end = point_start + this.sweep_point_count;

                this.sweep_y = this.channel_data[channel].slice(point_start, point_end);
                this.sweep_x = this.sample_times[channel].slice(point_start, point_end);
            }
        }
    },

    toString: function() {
        const version = `ABF${this.version.major}`;
        const file = path.basename(this.filepath);
        const channels = this.channel_count;
        const sweeps = this.sweep_count;
        const duration =  Math.round(100 * this.sweep_length_time * this.sweep_count / 60) / 100;
        const cstr = (channels !== 1) ? 'channels' : 'channel';
        const sstr = (sweeps !== 1) ? 'sweeps' : 'sweep';

        return `${version} file (${file}) with ${channels} ${cstr}, ${sweeps} ${sstr}, and duration of ${duration} min`;
    }
};

module.exports = function(filepath, verbosity=0) {
    if (verbosity) signale.start('Reading ABF file');

    let abf = Object.assign(Object.create(ABFPrototype), {
        filepath: path.resolve(filepath),
        id: path.parse(filepath).name,
    });

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

    abf.get_version(data);
    if (verbosity) signale.info(`File format: ${abf.version.major}`);

    if (abf.version.major === 0) {
        throw new Error('Invalid ABF file format');
    } else if (abf.version.major !== 2) {
        throw new Error(`Unsupported ABF file format: ${abf.version.major}`);
    }

    waiting('Reading sections', verbosity, () => abf.load_sections(data));

    waiting('Loading variables', verbosity, () => abf.load_variables());

    waiting('Loading data', verbosity, () => abf.load_data(data));

    waiting('Scaling data', verbosity, () => abf.scale_data());

    waiting('Setting sweep', verbosity, () => abf.set_sweep());

    return abf;
};
