const ABF = require('../main');
const path = require('path');

const DATA_DIR = path.join('test', 'data');
const TEST_FILE = path.join(DATA_DIR, '18710002.abf');
let abf = null;

beforeAll(() => { abf = ABF(TEST_FILE); });

test('Raises on FileNotExists', () => {
    expect(() => ABF('file.abf')).toThrow(Error);
});

test('Sets filepath', () => expect(abf).toMatchObject({
    filepath: path.resolve(TEST_FILE)
}));

test('Sets ID', () => expect(abf).toMatchObject({
    id: '18710002'
}));

test('Throws on invalid format', () => {
    expect(() => ABF(__filename)).toThrow('Invalid');
});

test('Sets version', () => expect(abf).toMatchObject({
    version: { major: 2 }
}));
