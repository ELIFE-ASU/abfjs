module.exports = function(data, section_map) {
    const block_size = 512;
    const [pos, size, count] = section_map.epoch_section;

    let offset = block_size * pos;
    let epoch = {
        epoch_num:            new Array(count),
        epoch_digital_output: new Array(count)
    };

    for (let i = 0; i < count; ++i) {
        epoch.epoch_num[i]             = data.readInt16LE(offset + 0);
        epoch.epoch_digital_output[i]  = data.readInt16LE(offset + 2);

        offset += size;
    }

    return epoch;
};
