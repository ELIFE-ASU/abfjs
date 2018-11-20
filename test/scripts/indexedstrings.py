import io, struct, json, os, sys

def isabf(f):
    return os.path.splitext(f)[1] == '.abf'

DIR = os.path.join('test', 'data')

def readjson(basename, section):
    path = os.path.join(DIR, '{}-{}.json'.format(basename, section))
    with open(path, 'r') as fb:
        return json.load(fb)

for abf_file in list(filter(isabf, os.listdir(DIR))):
    abf_path = os.path.join(DIR, abf_file)
    basename, _ = os.path.splitext(abf_file)
    json_path = os.path.join(DIR, '{}-indexedstrings.json'.format(basename))

    header, protocol, adc, dac, strings = list(map(lambda s: readjson(basename, s),
            ['header', 'proto', 'adc', 'dac', 'strings']))

    if os.path.isfile(json_path):
        os.remove(json_path)

    with open(abf_path, 'rb') as fb:
        indexed = bytes.fromhex(strings['strings'][0])
        indexed = indexed[indexed.rfind(b'\x00\x00'):]
        indexed = indexed.split(b'\x00')[1:]
        indexed = [x.decode('utf-8').strip() for x in indexed]

        indexed_strings = {
            'header': {
                'creator_name':  indexed[header['creator_name_index']],
                'modifier_name': indexed[header['modifier_name_index']],
                'protocol_path': indexed[header['protocol_path_index']]
            },
            'protocol': {
                'file_comment': indexed[protocol['file_comment_index']]
            },
            'adc': {
                'adc_channel_name': [],
                'adc_units':        []
            },
            'dac': {
                'dac_channel_name':  [],
                'dac_channel_units': [],
                'dac_file_path':     [],
                'leak_subtract_adc': []
            }
        }

        for i in range(len(adc['adc_channel_name_index'])):
            indexed_strings['adc']['adc_channel_name'].append(
                    indexed[adc['adc_channel_name_index'][i]])
            indexed_strings['adc']['adc_units'].append(
                    indexed[adc['adc_units_index'][i]])

        for i in range(len(dac['dac_channel_name_index'])):
            indexed_strings['dac']['dac_channel_name'].append(
                    indexed[dac['dac_channel_name_index'][i]])
            indexed_strings['dac']['dac_channel_units'].append(
                    indexed[dac['dac_channel_units_index'][i]])
            indexed_strings['dac']['dac_file_path'].append(
                    indexed[dac['dac_file_path_index'][i]])
            indexed_strings['dac']['leak_subtract_adc'].append(
                    indexed[dac['leak_subtract_adc_index'][i]])

    with open(json_path, 'w') as jb:
        json.dump(indexed_strings, jb, indent=4, sort_keys=True)
