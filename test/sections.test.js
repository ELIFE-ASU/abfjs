const fs = require('fs-extra');
const path = require('path');
const Sections = require('../src/sections');

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

        const sections = {
            got: Sections(data),

            header:  JSON.parse(fs.readFileSync(header_path), function(key, value) {
                if (Array.isArray(value)) {
                    return Buffer.from(value);
                } else {
                    return value;
                }
            }),
            section_map:     JSON.parse(fs.readFileSync(map_path)),
            protocol:        JSON.parse(fs.readFileSync(protocol_path)),
            adc:             JSON.parse(fs.readFileSync(adc_path)),
            dac:             JSON.parse(fs.readFileSync(dac_path)),
            epoch:           JSON.parse(fs.readFileSync(epoch_path)),
            epochperdac:     JSON.parse(fs.readFileSync(epochperdac_path)),
            tag:             JSON.parse(fs.readFileSync(tag_path)),
            strings:         JSON.parse(fs.readFileSync(strings_path)),
            indexed_strings: JSON.parse(fs.readFileSync(indexed_strings_path))
        };

        return [abf_path, sections];
    });
};

const table = build_table();

test.each(table)('.header(%s)', function(filename, {got, header}) {
    expect(got.header).toMatchObject(header);
});

test.each(table)('.section_map(%s)', function(filename, {got, section_map}) {
    expect(got.section_map).toMatchObject(section_map);
});

test.each(table)('.protocol(%s)', function(filename, {got, protocol}) {
    expect(got.protocol).toMatchObject(protocol);
});

test.each(table)('.adc(%s)', function(filename, {got, adc}) {
    expect(got.adc).toMatchObject(adc);
});

test.each(table)('.dac(%s)', function(filename, {got, dac}) {
    expect(got.dac).toMatchObject(dac);
});

test.each(table)('.epoch(%s)', function(filename, {got, epoch}) {
    expect(got.epoch).toMatchObject(epoch);
});

test.each(table)('.epochperdac(%s)', function(filename, {got, epochperdac}) {
    expect(got.epochperdac).toMatchObject(epochperdac);
});

test.each(table)('.tag(%s)', function(filename, {got, tag}) {
    expect(got.tag).toMatchObject(tag);
});

test.each(table)('.strings(%s)', function(filename, {got, strings}) {
    expect(got.strings).toMatchObject(strings);
});

test.each(table)('.indexed_strings(%s)', function(filename, {got, indexed_strings}) {
    expect(got.indexed_strings).toMatchObject(indexed_strings);
});
