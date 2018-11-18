module.exports = function(data, section_map) {
    const block_size = 512;
    const [pos, size, count] = section_map.tag_section;

    let offset = block_size * pos;
    let tag = {
        tag_time:   new Array(count),
        comment:    new Array(count),
        tag_type:   new Array(count),
        tag_number: new Array(count)
    };

    for (let i = 0; i < count; ++i) {
        tag.tag_time[i]     = data.readInt32LE(offset + 0);
        tag.comment[i]      = data.toString('utf8', offset + 4, offset + 60);
        tag.tag_type[i]     = data.readInt16LE(offset + 60);
        tag.tag_number[i]   = data.readInt16LE(offset + 62);

        offset += size;
    }

    return tag;
};
