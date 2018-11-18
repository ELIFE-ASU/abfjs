const fs = require('fs-extra');
const path = require('path');
const Header = require('../src/header');

const is_abf = (filename) => path.extname(filename) === '.abf';

const build_table = function() {
    const data_dir = path.join('test', 'data');
    const abf_files = fs.readdirSync(data_dir).filter(is_abf);
    const json_files = abf_files.map((f) => path.basename(f, '.abf') + '-header.json');

    return abf_files.map(function(abf_file, idx) {
        const abf_path = path.join(data_dir, abf_file);
        const json_path = path.join(data_dir, json_files[idx]);

        const got = Header(fs.readFileSync(abf_path));
        const expected = JSON.parse(fs.readFileSync(json_path), function(key, value) {
            if (Array.isArray(value)) {
                return Buffer.from(value);
            } else {
                return value;
            }
        });

        return [abf_path, got, expected];
    });
};

test.each(build_table())('.header(%s)', function(filename, got, expected) {
    expect(got).toMatchObject(expected);
});
