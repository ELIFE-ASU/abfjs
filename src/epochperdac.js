module.exports = function(data, section_map) {
    const block_size = 512;
    const [pos, size, count] = section_map.epoch_per_dac_section;

    let offset = block_size * pos;
    let epoch_per_dac = {
        epoch_num:            new Array(count),
        dac_num:              new Array(count),
        epoch_type:           new Array(count),
        epoch_init_level:     new Array(count),
        epoch_level_inc:      new Array(count),
        epoch_init_duration:  new Array(count),
        epoch_duration_inc:   new Array(count),
        epoch_pulse_period:   new Array(count),
        epoch_pulse_width:    new Array(count)
    };

    for (let i = 0; i < count; ++i) {
        epoch_per_dac.epoch_num[i]             = data.readInt16LE(offset + 0);
        epoch_per_dac.dac_num[i]               = data.readInt16LE(offset + 2);
        epoch_per_dac.epoch_type[i]            = data.readInt16LE(offset + 4);
        epoch_per_dac.epoch_init_level[i]      = data.readFloatLE(offset + 6);
        epoch_per_dac.epoch_level_inc[i]       = data.readFloatLE(offset + 10);
        epoch_per_dac.epoch_init_duration[i]   = data.readInt32LE(offset + 14);
        epoch_per_dac.epoch_duration_inc[i]    = data.readInt32LE(offset + 18);
        epoch_per_dac.epoch_pulse_period[i]    = data.readInt32LE(offset + 22);
        epoch_per_dac.epoch_pulse_width[i]     = data.readInt32LE(offset + 26);

        offset += size;
    }

    return epoch_per_dac;
};
