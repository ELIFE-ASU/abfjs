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
    json_path = os.path.join(DIR, '{}-epochperdac.json'.format(basename))

    if os.path.isfile(json_path):
        os.remove(json_path)

    with open(abf_path, 'rb') as fb:
        pos, size, count = readStruct(fb, 'IIl', 156)
        offset = 512 * pos;

        epochperdac = {
            'epoch_num':            [None]*count,
            'dac_num':              [None]*count,
            'epoch_type':           [None]*count,
            'epoch_init_level':     [None]*count,
            'epoch_level_inc':      [None]*count,
            'epoch_init_duration':  [None]*count,
            'epoch_duration_inc':   [None]*count,
            'epoch_pulse_period':   [None]*count,
            'epoch_pulse_width':    [None]*count,
        }

        for i in range(count):
            fb.seek(offset + i*size)
            epochperdac['epoch_num'][i]             = readStruct(fb, 'h') # 0
            epochperdac['dac_num'][i]               = readStruct(fb, 'h') # 2
            epochperdac['epoch_type'][i]            = readStruct(fb, 'h') # 4
            epochperdac['epoch_init_level'][i]      = readStruct(fb, 'f') # 6
            epochperdac['epoch_level_inc'][i]       = readStruct(fb, 'f') # 10
            epochperdac['epoch_init_duration'][i]   = readStruct(fb, 'i') # 14
            epochperdac['epoch_duration_inc'][i]    = readStruct(fb, 'i') # 18
            epochperdac['epoch_pulse_period'][i]    = readStruct(fb, 'i') # 22
            epochperdac['epoch_pulse_width'][i]     = readStruct(fb, 'i') # 26

    with open(json_path, 'w') as jb:
        json.dump(epochperdac, jb, indent=4, sort_keys=True)
