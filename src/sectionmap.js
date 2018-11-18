module.exports = function(data) {
    const read_section = function(data, offset) {
        let pos = data.readUInt32LE(offset),
            size = data.readUInt32LE(offset + 4),
            count = data.readUInt32LE(offset + 8);
        return [pos, size, count];
    };

    let section_map = {
        protocol_section:       read_section(data, 76),
        adc_section:            read_section(data, 92),
        dac_section:            read_section(data, 108),
        epoch_section:          read_section(data, 124),
        adc_per_dac_section:    read_section(data, 140),
        epoch_per_dac_section:  read_section(data, 156),
        user_list_section:      read_section(data, 172),
        stats_region_section:   read_section(data, 188),
        math_section:           read_section(data, 204),
        strings_section:        read_section(data, 220),
        data_section:           read_section(data, 236),
        tag_section:            read_section(data, 252),
        scope_section:          read_section(data, 268),
        delta_section:          read_section(data, 284),
        voice_tag_section:      read_section(data, 300),
        synch_array_section:    read_section(data, 316),
        annotation_section:     read_section(data, 332),
        stats_section:          read_section(data, 348)
    };

    return section_map;
};
