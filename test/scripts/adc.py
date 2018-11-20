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

TELEGRAPHS = [
    "Unknown instrument (manual or user defined telegraph table).",
    "Axopatch-1 with CV-4-1/100",
    "Axopatch-1 with CV-4-0.1/100",
    "Axopatch-1B(inv.) CV-4-1/100",
    "Axopatch-1B(inv) CV-4-0.1/100",
    "Axopatch 200 with CV 201",
    "Axopatch 200 with CV 202",
    "GeneClamp",
    "Dagan 3900",
    "Dagan 3900A",
    "Dagan CA-1  Im=0.1",
    "Dagan CA-1  Im=1.0",
    "Dagan CA-1  Im=10",
    "Warner OC-725",
    "Warner OC-725",
    "Axopatch 200B",
    "Dagan PC-ONE  Im=0.1",
    "Dagan PC-ONE  Im=1.0",
    "Dagan PC-ONE  Im=10",
    "Dagan PC-ONE  Im=100",
    "Warner BC-525C",
    "Warner PC-505",
    "Warner PC-501",
    "Dagan CA-1  Im=0.05",
    "MultiClamp 700",
    "Turbo Tec",
    "OpusXpress 6000A",
    "Axoclamp 900"
]

def isabf(f):
    return os.path.splitext(f)[1] == '.abf'

DIR = os.path.join('test', 'data')

for abf_file in list(filter(isabf, os.listdir(DIR))):
    abf_path = os.path.join(DIR, abf_file)
    basename, _ = os.path.splitext(abf_file)
    json_path = os.path.join(DIR, '{}-adc.json'.format(basename))

    if os.path.isfile(json_path):
        os.remove(json_path)

    with open(abf_path, 'rb') as fb:
        pos, size, count = readStruct(fb, 'IIl', 92)
        offset = 512 * pos;

        adc = {
            'adc_num':                          [None]*count,       
            'telegraph_enable':                 [None]*count,       
            'telegraph_instrument':             [None]*count,       
            'telegraph_addit_gain':             [None]*count,       
            'telegraph_filter':                 [None]*count,
            'telegraph_membrane_cap':           [None]*count,
            'telegraph_mode':                   [None]*count,
            'telegraph_access_resistance':      [None]*count,
            'adc_p_to_l_channel_map':           [None]*count,
            'adc_sampling_sequence':            [None]*count,
            'adc_programmable_gain':            [None]*count,
            'adc_display_amplification':        [None]*count,
            'adc_display_offset':               [None]*count,
            'instrument_scale_factor':          [None]*count,
            'instrument_offset':                [None]*count,
            'signal_gain':                      [None]*count,
            'signal_offset':                    [None]*count,
            'signal_lowpass_filter':            [None]*count,
            'signal_highpass_filter':           [None]*count,
            'lowpass_filter_type':              [None]*count,
            'highpass_filter_type':             [None]*count,
            'post_process_lowpass_filter':      [None]*count,
            'post_process_lowpass_filter_type': [None]*count,
            'enabled_during_pn':                [None]*count,
            'stats_channel_polarity':           [None]*count,
            'adc_channel_name_index':           [None]*count,
            'adc_units_index':                  [None]*count
        }

        for i in range(count):
            fb.seek(offset + i*size)
            adc['adc_num'][i]                           = readStruct(fb, 'h') # 0
            adc['telegraph_enable'][i]                  = readStruct(fb, 'h') # 2
            adc['telegraph_instrument'][i]              = readStruct(fb, 'h') # 4
            adc['telegraph_addit_gain'][i]              = readStruct(fb, 'f') # 6
            adc['telegraph_filter'][i]                  = readStruct(fb, 'f') # 10
            adc['telegraph_membrane_cap'][i]            = readStruct(fb, 'f') # 14
            adc['telegraph_mode'][i]                    = readStruct(fb, 'h') # 18
            adc['telegraph_access_resistance'][i]       = readStruct(fb, 'f') # 20
            adc['adc_p_to_l_channel_map'][i]            = readStruct(fb, 'h') # 24
            adc['adc_sampling_sequence'][i]             = readStruct(fb, 'h') # 26
            adc['adc_programmable_gain'][i]             = readStruct(fb, 'f') # 28
            adc['adc_display_amplification'][i]         = readStruct(fb, 'f') # 32
            adc['adc_display_offset'][i]                = readStruct(fb, 'f') # 36
            adc['instrument_scale_factor'][i]           = readStruct(fb, 'f') # 40
            adc['instrument_offset'][i]                 = readStruct(fb, 'f') # 44
            adc['signal_gain'][i]                       = readStruct(fb, 'f') # 48
            adc['signal_offset'][i]                     = readStruct(fb, 'f') # 52
            adc['signal_lowpass_filter'][i]             = readStruct(fb, 'f') # 56
            adc['signal_highpass_filter'][i]            = readStruct(fb, 'f') # 60
            adc['lowpass_filter_type'][i]               = readStruct(fb, 'b') # 64
            adc['highpass_filter_type'][i]              = readStruct(fb, 'b') # 65
            adc['post_process_lowpass_filter'][i]       = readStruct(fb, 'f') # 66
            adc['post_process_lowpass_filter_type'][i]  = readStruct(fb, 'c') # 70
            adc['enabled_during_pn'][i]                 = readStruct(fb, 'b') # 71
            adc['stats_channel_polarity'][i]            = readStruct(fb, 'h') # 72
            adc['adc_channel_name_index'][i]            = readStruct(fb, 'i') # 74
            adc['adc_units_index'][i]                   = readStruct(fb, 'i') # 78

            instrument = adc['telegraph_instrument'][i]
            if instrument in range(len(TELEGRAPHS)):
                adc['telegraph_instrument'][i] = TELEGRAPHS[instrument]
            else:
                adc['telegraph_instrument'][i] = TELEGRAPHS[0]

    with open(json_path, 'w') as jb:
        json.dump(adc, jb, indent=4, sort_keys=True)
