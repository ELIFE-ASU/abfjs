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
    json_path = os.path.join(DIR, '{}-smap.json'.format(basename))

    if os.path.isfile(json_path):
        os.remove(json_path)

    with open(abf_path, 'rb') as fb:
        section_map = {
            'protocol_section':       readStruct(fb, "IIl", 76),
            'adc_section':            readStruct(fb, "IIl", 92),
            'dac_section':            readStruct(fb, "IIl", 108),
            'epoch_section':          readStruct(fb, "IIl", 124),
            'adc_per_dac_section':    readStruct(fb, "IIl", 140),
            'epoch_per_dac_section':  readStruct(fb, "IIl", 156),
            'user_list_section':      readStruct(fb, "IIl", 172),
            'stats_region_section':   readStruct(fb, "IIl", 188),
            'math_section':           readStruct(fb, "IIl", 204),
            'strings_section':        readStruct(fb, "IIl", 220),
            'data_section':           readStruct(fb, "IIl", 236),
            'tag_section':            readStruct(fb, "IIl", 252),
            'scope_section':          readStruct(fb, "IIl", 268),
            'delta_section':          readStruct(fb, "IIl", 284),
            'voice_tag_section':      readStruct(fb, "IIl", 300),
            'synch_array_section':    readStruct(fb, "IIl", 316),
            'annotation_section':     readStruct(fb, "IIl", 332),
            'stats_section':          readStruct(fb, "IIl", 348)
        }

    with open(json_path, 'w') as jb:
        json.dump(section_map, jb, indent=4, sort_keys=True)
