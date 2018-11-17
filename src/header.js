module.exports = function(data) {
    let header = {
        signature: data.toString('utf8', 0, 4),
        version_number: data.slice(4, 8),
        info_size: data.readUInt32LE(8),
        actual_episodes: data.readUInt32LE(12),
        start_date: data.readUInt32LE(16),
        start_time_ms: data.readUInt32LE(20),
        stopwatch_time: data.readUInt32LE(24),
        filetype: data.readUInt16LE(28),
        data_format: data.readUInt16LE(30),
        simultaneous_scan: data.readUInt16LE(32),
        crc_enable: data.readUInt16LE(34),
        file_crc: data.readUInt32LE(36),
        file_guid: data.slice(40, 56),
        creator_version: data.slice(56, 60),
        creator_name_index: data.readUInt32LE(60),
        modifier_version: data.readUInt32LE(64),
        modifier_name_index: data.readUInt32LE(68),
        protocol_path_index: data.readUInt32LE(72)
    };

    let version_parts_int = Buffer.from(header.version_number).reverse(),
        version_parts = version_parts_int.map((x) => x.toString());
    header.version_string = version_parts.join('.');
    header.version_float = parseFloat(version_parts.join(''))/1000.0;
    header.version = {
        major: version_parts_int[0],
        minor: version_parts_int[1],
        bugfix: version_parts_int[2],
        build: version_parts_int[3]
    };

    version_parts_int = Buffer.from(header.creator_version).reverse();
    version_parts = version_parts_int.map((x) => x.toString());
    header.creator_string = version_parts.join('.');
    header.creator_float = parseFloat(version_parts.join(''))/1000.0;
    header.creator = {
        major: version_parts_int[0],
        minor: version_parts_int[1],
        bugfix: version_parts_int[2],
        build: version_parts_int[3]
    };

    let guid = [];
    [3, 2, 1, 0, 5, 4, 7, 6, 8, 9, 10, 11, 12, 13, 15, 15].forEach((i) => {
        guid.push(('00' + header.file_guid[i].toString(16)).substr(-2));
    });
    [4, 7, 10, 13].forEach((i) => {
        guid.splice(i, 0, '-');
    });
    header.guid = `{${guid.join('')}}`.toUpperCase();

    let year = Math.floor(header.start_date / 10000),
        month = Math.floor((header.start_date - 10000*year) / 100),
        day = header.start_date - 10000*year - 100*month,
        date = new Date(year, month - 1, day, 0, 0, 0, header.start_time_ms),
        tzone = date.getTimezoneOffset();
    header.date_time = new Date(date.getTime() - tzone * 60000).toISOString();

    return header;
};
