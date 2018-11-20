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
    json_path = os.path.join(DIR, '{}-dac.json'.format(basename))

    if os.path.isfile(json_path):
        os.remove(json_path)

    with open(abf_path, 'rb') as fb:
        pos, size, count = readStruct(fb, 'IIl', 108)
        offset = 512 * pos;

        dac = {
            'dac_num':                              [None]*count,
            'telegraph_dac_scale_factor_enable':    [None]*count,
            'instrument_holding_level':             [None]*count,
            'dac_scale_factor':                     [None]*count,
            'dac_holding_level':                    [None]*count,
            'dac_calibration_factor':               [None]*count,
            'dac_calibration_offset':               [None]*count,
            'dac_channel_name_index':               [None]*count,
            'dac_channel_units_index':              [None]*count,
            'dac_file_ptr':                         [None]*count,
            'dac_file_num_episodes':                [None]*count,
            'waveform_enable':                      [None]*count,
            'waveform_source':                      [None]*count,
            'inter_episode_level':                  [None]*count,
            'dac_file_scale':                       [None]*count,
            'dac_file_offset':                      [None]*count,
            'dac_file_episode_num':                 [None]*count,
            'dac_file_adc_num':                     [None]*count,
            'condit_enable':                        [None]*count,
            'condit_num_pulses':                    [None]*count,
            'baseline_duration':                    [None]*count,
            'baseline_level':                       [None]*count,
            'step_duration':                        [None]*count,
            'step_level':                           [None]*count,
            'post_train_period':                    [None]*count,
            'post_train_level':                     [None]*count,
            'memb_test_enable':                     [None]*count,
            'leak_subtract_type':                   [None]*count,
            'pn_polarity':                          [None]*count,
            'pn_holding_level':                     [None]*count,
            'pn_num_adc_channels':                  [None]*count,
            'pn_position':                          [None]*count,
            'pn_num_pulses':                        [None]*count,
            'pn_settling_time':                     [None]*count,
            'pn_interpulse':                        [None]*count,
            'ltp_usage_of_dac':                     [None]*count,
            'ltp_presynaptic_pulses':               [None]*count,
            'dac_file_path_index':                  [None]*count,
            'memb_test_pre_settling_time_ms':       [None]*count,
            'memb_test_post_settling_time_ms':      [None]*count,
            'leak_subtract_adc_index':              [None]*count
        }

        for i in range(count):
            fb.seek(offset + i*size)
            dac['dac_num'][i]                           = readStruct(fb, 'h') # 0
            dac['telegraph_dac_scale_factor_enable'][i] = readStruct(fb, 'h') # 2
            dac['instrument_holding_level'][i]          = readStruct(fb, 'f') # 4
            dac['dac_scale_factor'][i]                  = readStruct(fb, 'f') # 8
            dac['dac_holding_level'][i]                 = readStruct(fb, 'f') # 12
            dac['dac_calibration_factor'][i]            = readStruct(fb, 'f') # 16
            dac['dac_calibration_offset'][i]            = readStruct(fb, 'f') # 20
            dac['dac_channel_name_index'][i]            = readStruct(fb, 'i') # 24
            dac['dac_channel_units_index'][i]           = readStruct(fb, 'i') # 28
            dac['dac_file_ptr'][i]                      = readStruct(fb, 'i') # 32
            dac['dac_file_num_episodes'][i]             = readStruct(fb, 'i') # 36
            dac['waveform_enable'][i]                   = readStruct(fb, 'h') # 40
            dac['waveform_source'][i]                   = readStruct(fb, 'h') # 42
            dac['inter_episode_level'][i]               = readStruct(fb, 'h') # 44
            dac['dac_file_scale'][i]                    = readStruct(fb, 'f') # 46
            dac['dac_file_offset'][i]                   = readStruct(fb, 'f') # 50
            dac['dac_file_episode_num'][i]              = readStruct(fb, 'i') # 54
            dac['dac_file_adc_num'][i]                  = readStruct(fb, 'h') # 58
            dac['condit_enable'][i]                     = readStruct(fb, 'h') # 60
            dac['condit_num_pulses'][i]                 = readStruct(fb, 'i') # 62
            dac['baseline_duration'][i]                 = readStruct(fb, 'f') # 66
            dac['baseline_level'][i]                    = readStruct(fb, 'f') # 70
            dac['step_duration'][i]                     = readStruct(fb, 'f') # 74
            dac['step_level'][i]                        = readStruct(fb, 'f') # 78
            dac['post_train_period'][i]                 = readStruct(fb, 'f') # 82
            dac['post_train_level'][i]                  = readStruct(fb, 'f') # 86
            dac['memb_test_enable'][i]                  = readStruct(fb, 'h') # 90
            dac['leak_subtract_type'][i]                = readStruct(fb, 'h') # 92
            dac['pn_polarity'][i]                       = readStruct(fb, 'h') # 94
            dac['pn_holding_level'][i]                  = readStruct(fb, 'f') # 96
            dac['pn_num_adc_channels'][i]               = readStruct(fb, 'h') # 100
            dac['pn_position'][i]                       = readStruct(fb, 'h') # 102
            dac['pn_num_pulses'][i]                     = readStruct(fb, 'h') # 104
            dac['pn_settling_time'][i]                  = readStruct(fb, 'f') # 106
            dac['pn_interpulse'][i]                     = readStruct(fb, 'f') # 110
            dac['ltp_usage_of_dac'][i]                  = readStruct(fb, 'h') # 114
            dac['ltp_presynaptic_pulses'][i]            = readStruct(fb, 'h') # 116
            dac['dac_file_path_index'][i]               = readStruct(fb, 'i') # 118
            dac['memb_test_pre_settling_time_ms'][i]    = readStruct(fb, 'f') # 122
            dac['memb_test_post_settling_time_ms'][i]   = readStruct(fb, 'f') # 126
            dac['leak_subtract_adc_index'][i]           = readStruct(fb, 'h') # 130

    with open(json_path, 'w') as jb:
        json.dump(dac, jb, indent=4, sort_keys=True)
