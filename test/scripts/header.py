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
    json_path = os.path.join(DIR, '{}-header.json'.format(basename))

    if os.path.isfile(json_path):
        os.remove(json_path)

    with open(abf_path, 'rb') as fb:
        header = {
            'signature':           readStruct(fb, '4s'),
            'version_number':      readStruct(fb, '4b'),
            'info_size':           readStruct(fb, 'I'),
            'actual_episodes':     readStruct(fb, 'I'),
            'start_date':          readStruct(fb, 'I'),
            'start_time_ms':       readStruct(fb, 'I'),
            'stopwatch_time':      readStruct(fb, 'I'),
            'filetype':            readStruct(fb, 'H'),
            'data_format':         readStruct(fb, 'H'),
            'simultaneous_scan':   readStruct(fb, 'H'),
            'crc_enable':          readStruct(fb, 'H'),
            'file_crc':            readStruct(fb, 'I'),
            'file_guid':           readStruct(fb, '16B'),
            'creator_version':     readStruct(fb, '4B'),
            'creator_name_index':  readStruct(fb, 'I'),
            'modifier_version':    readStruct(fb, 'I'),
            'modifier_name_index': readStruct(fb, 'I'),
            'protocol_path_index': readStruct(fb, 'I')
        }

        versionPartsInt = header['version_number'][::-1]
        versionParts = [str(x) for x in versionPartsInt]
        header['version_string'] = '.'.join(versionParts)
        header['version_float'] = int(''.join(versionParts))/1000.0
        header['version'] = {
            'major': versionPartsInt[0],
            'minor': versionPartsInt[1],
            'bugfix': versionPartsInt[2],
            'build': versionPartsInt[3]
        }

        versionPartsInt = header['creator_version'][::-1]
        versionParts = [str(x) for x in versionPartsInt]
        header['creator_string'] = '.'.join(versionParts)
        header['creator_float'] = int(''.join(versionParts))/1000.0
        header['creator'] = {
            'major': versionPartsInt[0],
            'minor': versionPartsInt[1],
            'bugfix': versionPartsInt[2],
            'build': versionPartsInt[3]
        }

        guid = []
        for i in [3, 2, 1, 0, 5, 4, 7, 6, 8, 9, 10, 11, 12, 13, 15, 15]:
            guid.append("%.2X" % (header['file_guid'][i]))
        for i in [4, 7, 10, 13]:
            guid.insert(i, "-")
        header['guid'] = "{%s}" % ("".join(guid))

        startDate = str(header['start_date'])
        startTime = header['start_time_ms'] / 1000
        startDate = datetime.datetime.strptime(startDate, "%Y%m%d")
        timeStamp = startDate + datetime.timedelta(seconds=startTime)
        header['date_time'] = timeStamp.isoformat()[:-3] + 'Z'

    with open(json_path, 'w') as jb:
        json.dump(header, jb, indent=4, sort_keys=True)
