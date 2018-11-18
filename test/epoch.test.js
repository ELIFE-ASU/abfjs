const fs = require('fs-extra');
const path = require('path');
const {SectionMap, Epoch} = require('../src/header');

const is_abf = (filename) => path.extname(filename) === '.abf';

const build_table = function() {
    const data_dir = path.join('test', 'data');
    const abf_files = fs.readdirSync(data_dir).filter(is_abf);
    const json_files = abf_files.map((f) => path.basename(f, '.abf') + '-epoch.json');

    return abf_files.map(function(abf_file, idx) {
        const abf_path = path.join(data_dir, abf_file);
        const json_path = path.join(data_dir, json_files[idx]);
        const data = fs.readFileSync(abf_path);

        const got = Epoch(data, SectionMap(data));
        const expected = JSON.parse(fs.readFileSync(json_path));

        return [abf_path, got, expected];
    });
};

test.each(build_table())('.epoch(%s)', function(filename, got, expected) {
    expect(got).toMatchObject(expected);
});
