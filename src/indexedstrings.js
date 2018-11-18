module.exports = function(header, protocol, adc, dac, strings) {
    let buffer = Buffer.from(strings.strings[0], 'hex'),
        start = buffer.lastIndexOf('\x00\x00'),
        indexed = new Array();

    for (let stop = start + 1; stop != buffer.length; ++stop) {
        if (buffer[stop] == 0) {
            indexed.push(buffer.toString('utf-8', start + 1, stop).trim());
            start = stop;
        }
    }

    let indexed_strings = {
        header: {
            creator_name:  indexed[header.creator_name_index],
            modifier_name: indexed[header.modifier_name_index],
            protocol_path: indexed[header.protocol_path_index]
        },
        protocol: {
            file_comment: indexed[protocol.file_comment_index]
        },
        adc: {
            adc_channel_name: [],
            adc_units:        []
        },
        dac: {
            dac_channel_name:  [],
            dac_channel_units: [],
            dac_file_path:     [],
            leak_subtract_adc: []
        }
    };

    for (let i = 0; i < adc.adc_channel_name_index.length; ++i) {
        indexed_strings.adc.adc_channel_name.push(
            indexed[adc.adc_channel_name_index[i]]);
        indexed_strings.adc.adc_units.push(
            indexed[adc.adc_units_index[i]]);
    }

    for (let i = 0; i < dac.dac_channel_name_index.length; ++i) {
        indexed_strings.dac.dac_channel_name.push(
            indexed[dac.dac_channel_name_index[i]]);
        indexed_strings.dac.dac_channel_units.push(
            indexed[dac.dac_channel_units_index[i]]);
        indexed_strings.dac.dac_file_path.push(
            indexed[dac.dac_file_path_index[i]]);
        indexed_strings.dac.leak_subtract_adc.push(
            indexed[dac.leak_subtract_adc_index[i]]);
    }

    return indexed_strings;
};
