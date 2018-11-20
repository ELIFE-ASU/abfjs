const ABF = require('../main');
const path = require('path');

const DATA_DIR = path.join('test', 'data');
const TEST_FILE = path.join(DATA_DIR, '18710002.abf');

test('ABF raises on FileNotExists', () => {
    expect(() => ABF('file.abf')).toThrow(Error);
});

test('ABF sets filepath', () => {
    expect(ABF(TEST_FILE)).toMatchObject({
        filepath: path.resolve(TEST_FILE),
    });
});

test('ABF sets ID', () => expect(ABF(TEST_FILE)).toMatchObject({ id: '18710002' }));
