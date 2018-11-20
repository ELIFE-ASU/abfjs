import io, struct, json, os, datetime

def readStruct(fb, structFormat, seek=False, cleanStrings=True):
    if not isinstance(fb, io.BufferedReader):
        raise ValueError("require an ABF file open in 'fb' mode")

    if seek:
        fb.seek(seek)

    varSize = struct.calcsize(structFormat)
    byteString = fb.read(varSize)
    vals = struct.unpack(structFormat, byteString)
    vals = list(vals)

    if cleanStrings:
        for i in range(len(vals)):
            if type(vals[i]) == type(b''):
                vals[i] = vals[i].decode("ascii", errors='ignore').strip()

    if len(vals) == 1:
        vals = vals[0]

    return vals

def isabf(f):
    return os.path.splitext(f)[1] == '.abf'

DIR = os.path.join('test', 'data')

for abf_file in list(filter(isabf, os.listdir(DIR))):
    abf_path = os.path.join(DIR, abf_file)
    basename, _ = os.path.splitext(abf_file)
    json_path = os.path.join(DIR, '{}-tag.json'.format(basename))

    if os.path.isfile(json_path):
        os.remove(json_path)

    with open(abf_path, 'rb') as fb:
        pos, size, count = readStruct(fb, 'IIl', 252)
        offset = 512 * pos;

        tag = {
            'tag_time':     [None]*count,
            'comment':      [None]*count,
            'tag_type':     [None]*count,
            'tag_number':   [None]*count
        }

        for i in range(count):
            fb.seek(offset + i*size)
            tag['tag_time'][i]      = readStruct(fb, 'i')
            tag['comment'][i]       = readStruct(fb, '56s')
            tag['tag_type'][i]      = readStruct(fb, 'h')
            tag['tag_number'][i]    = readStruct(fb, 'h')

    with open(json_path, 'w') as jb:
        json.dump(tag, jb, indent=4, sort_keys=True)
