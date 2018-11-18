module.exports = function(data, section_map) {
    const block_size = 512;
    const [pos, size, count] = section_map.strings_section;

    let offset = block_size * pos;
    let strings = {
        strings: new Array(count)
    };

    for (let i = 0; i < count; ++i) {
        strings.strings[i] = data.toString('hex', offset, offset + size);
        offset += size;
    }

    return strings;
};
