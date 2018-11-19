const fs = require('fs-extra');
const path = require('path');
const sections = require('../src/sections');

const is_abf = (filename) => path.extname(filename) === '.abf';
const basename = (filename) => path.basename(filename, '.abf');

const build_table = function() {
    const data_dir = path.join('test', 'data');
    const abf_files = fs.readdirSync(data_dir).filter(is_abf);

    const header_files          = abf_files.map((f) => basename(f) + '-header.json');
    const map_files             = abf_files.map((f) => basename(f) + '-smap.json');
    const protocol_files        = abf_files.map((f) => basename(f) + '-proto.json');
    const adc_files             = abf_files.map((f) => basename(f) + '-adc.json');
    const dac_files             = abf_files.map((f) => basename(f) + '-dac.json');
    const epoch_files           = abf_files.map((f) => basename(f) + '-epoch.json');
    const epochperdac_files     = abf_files.map((f) => basename(f) + '-epochperdac.json');
    const tag_files             = abf_files.map((f) => basename(f) + '-tag.json');
    const strings_files         = abf_files.map((f) => basename(f) + '-strings.json');
    const indexed_strings_files = abf_files.map((f) => basename(f) + '-indexedstrings.json');

    return abf_files.map(function(abf_file, idx) {
        const abf_path             = path.join(data_dir, abf_file);
        const header_path          = path.join(data_dir, header_files[idx]);
        const map_path             = path.join(data_dir, map_files[idx]);
        const protocol_path        = path.join(data_dir, protocol_files[idx]);
        const adc_path             = path.join(data_dir, adc_files[idx]);
        const dac_path             = path.join(data_dir, dac_files[idx]);
        const epoch_path           = path.join(data_dir, epoch_files[idx]);
        const epochperdac_path     = path.join(data_dir, epochperdac_files[idx]);
        const tag_path             = path.join(data_dir, tag_files[idx]);
        const strings_path         = path.join(data_dir, strings_files[idx]);
        const indexed_strings_path = path.join(data_dir, indexed_strings_files[idx]);

        const data = fs.readFileSync(abf_path);

        const header = {
            got: sections.Header(data),
            expected:  JSON.parse(fs.readFileSync(header_path), function(key, value) {
                if (Array.isArray(value)) {
                    return Buffer.from(value);
                } else {
                    return value;
                }
            })
        };

        const section_map = {
            got: sections.SectionMap(data),
            expected: JSON.parse(fs.readFileSync(map_path))
        };

        const protocol = {
            got: sections.Protocol(data, section_map.got),
            expected: JSON.parse(fs.readFileSync(protocol_path))
        };

        const adc = {
            got: sections.ADC(data, section_map.got),
            expected: JSON.parse(fs.readFileSync(adc_path))
        };

        const dac = {
            got: sections.DAC(data, section_map.got),
            expected: JSON.parse(fs.readFileSync(dac_path))
        };

        const epoch = {
            got: sections.Epoch(data, section_map.got),
            expected: JSON.parse(fs.readFileSync(epoch_path))
        };

        const epochperdac = {
            got: sections.EpochPerDAC(data, section_map.got),
            expected: JSON.parse(fs.readFileSync(epochperdac_path))
        };

        const tag = {
            got: sections.Tag(data, section_map.got),
            expected: JSON.parse(fs.readFileSync(tag_path))
        };

        const strings = {
            got: sections.Strings(data, section_map.got),
            expected: JSON.parse(fs.readFileSync(strings_path))
        };

        const indexed_strings = {
            got: sections.IndexedStrings(header.got, protocol.got, adc.got, dac.got, strings.got),
            expected: JSON.parse(fs.readFileSync(indexed_strings_path))
        };

        return [abf_path, {
            header,
            section_map,
            protocol,
            adc,
            dac,
            epoch,
            epochperdac,
            tag,
            strings,
            indexed_strings
        }];
    });
};

const table = build_table();

test.each(table)('.header(%s)', function(filename, {header}) {
    expect(header.got).toMatchObject(header.expected);
});

test.each(table)('.section_map(%s)', function(filename, {section_map}) {
    expect(section_map.got).toMatchObject(section_map.expected);
});

test.each(table)('.protocol(%s)', function(filename, {protocol}) {
    expect(protocol.got).toMatchObject(protocol.expected);
});

test.each(table)('.adc(%s)', function(filename, {adc}) {
    expect(adc.got).toMatchObject(adc.expected);
});

test.each(table)('.dac(%s)', function(filename, {dac}) {
    expect(dac.got).toMatchObject(dac.expected);
});

test.each(table)('.epoch(%s)', function(filename, {epoch}) {
    expect(epoch.got).toMatchObject(epoch.expected);
});

test.each(table)('.epochperdac(%s)', function(filename, {epochperdac}) {
    expect(epochperdac.got).toMatchObject(epochperdac.expected);
});

test.each(table)('.tag(%s)', function(filename, {tag}) {
    expect(tag.got).toMatchObject(tag.expected);
});

test.each(table)('.strings(%s)', function(filename, {strings}) {
    expect(strings.got).toMatchObject(strings.expected);
});

test.each(table)('.indexed_strings(%s)', function(filename, {indexed_strings}) {
    expect(indexed_strings.got).toMatchObject(indexed_strings.expected);
});
