const fs = require('fs-extra');
const path = require('path');
const Header = require('../src/header');
const SectionMap = require('../src/sectionmap');
const Protocol = require('../src/protocol');
const ADC = require('../src/adc');
const DAC = require('../src/dac');
const Strings = require('../src/strings');
const IndexedStrings = require('../src/indexedstrings');

const is_abf = (filename) => path.extname(filename) === '.abf';

const build_table = function() {
    const data_dir = path.join('test', 'data');
    const abf_files = fs.readdirSync(data_dir).filter(is_abf);
    const json_files = abf_files.map((f) => path.basename(f, '.abf') + '-indexedstrings.json');

    return abf_files.map(function(abf_file, idx) {
        const abf_path = path.join(data_dir, abf_file);
        const json_path = path.join(data_dir, json_files[idx]);
        const data = fs.readFileSync(abf_path);

        const header = Header(data);
        const section_map = SectionMap(data);
        const protocol = Protocol(data, section_map);
        const adc = ADC(data, section_map);
        const dac = DAC(data, section_map);
        const strings = Strings(data, section_map);

        const got = IndexedStrings(header, protocol, adc, dac, strings);
        const expected = JSON.parse(fs.readFileSync(json_path));

        return [abf_path, got, expected];
    });
};

test.each(build_table())('.indexed_strings(%s)', function(filename, got, expected) {
    expect(got).toMatchObject(expected);
});
