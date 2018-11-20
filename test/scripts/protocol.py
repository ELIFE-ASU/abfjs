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

DIGITIZERS = [
    "Unknown",
    "Demo",
    "MiniDigi",
    "DD132X",
    "OPUS",
    "PATCH",
    "Digidata 1440",
    "MINIDIGI2",
    "Digidata 1550"
]

def isabf(f):
    return os.path.splitext(f)[1] == '.abf'

DIR = os.path.join('test', 'data')

for abf_file in list(filter(isabf, os.listdir(DIR))):
    abf_path = os.path.join(DIR, abf_file)
    basename, _ = os.path.splitext(abf_file)
    json_path = os.path.join(DIR, '{}-proto.json'.format(basename))

    if os.path.isfile(json_path):
        os.remove(json_path)

    with open(abf_path, 'rb') as fb:
        fb.seek(512 * readStruct(fb, 'I', 76))
        protocol = {
            'operation_mode':                   readStruct(fb, 'h'),  # 0
            'adc_sequence_interval':            readStruct(fb, 'f'),  # 2
            'enable_file_compression':          readStruct(fb, 'b'),  # 6
            'unused':                           readStruct(fb, '3c'), # 7
            'file_compression_ratio':           readStruct(fb, 'I'),  # 10
            'synch_time_unit':                  readStruct(fb, 'f'),  # 14
            'seconds_per_run':                  readStruct(fb, 'f'),  # 18
            'num_samples_per_episode':          readStruct(fb, 'i'),  # 22
            'pre_trigger_samples':              readStruct(fb, 'i'),  # 26
            'episodes_per_run':                 readStruct(fb, 'i'),  # 30
            'runs_per_trial':                   readStruct(fb, 'i'),  # 34
            'num_trials':                       readStruct(fb, 'i'),  # 38
            'averaging_mode':                   readStruct(fb, 'h'),  # 42
            'undo_run_count':                   readStruct(fb, 'h'),  # 44
            'first_episode_in_run':             readStruct(fb, 'h'),  # 46
            'trigger_threshold':                readStruct(fb, 'f'),  # 48
            'trigger_source':                   readStruct(fb, 'h'),  # 52
            'trigger_action':                   readStruct(fb, 'h'),  # 54
            'trigger_polarity':                 readStruct(fb, 'h'),  # 56
            'scope_output_interval':            readStruct(fb, 'f'),  # 58
            'episode_start_to_start':           readStruct(fb, 'f'),  # 62
            'run_start_to_start':               readStruct(fb, 'f'),  # 66
            'average_count':                    readStruct(fb, 'i'),  # 70
            'trial_start_to_start':             readStruct(fb, 'f'),  # 74
            'auto_trigger_strategy':            readStruct(fb, 'h'),  # 78
            'first_run_delays':                 readStruct(fb, 'f'),  # 80
            'channel_stats_strategy':           readStruct(fb, 'h'),  # 84
            'samples_per_trace':                readStruct(fb, 'i'),  # 86
            'start_display_num':                readStruct(fb, 'i'),  # 90
            'finish_display_num':               readStruct(fb, 'i'),  # 94
            'show_pn_raw_data':                 readStruct(fb, 'h'),  # 98
            'statistics_period':                readStruct(fb, 'f'),  # 100
            'statistics_measurements':          readStruct(fb, 'i'),  # 104
            'statistics_save_strategy':         readStruct(fb, 'h'),  # 108
            'adc_range':                        readStruct(fb, 'f'),  # 110
            'dac_range':                        readStruct(fb, 'f'),  # 114
            'adc_resolution':                   readStruct(fb, 'i'),  # 118
            'dac_resolution':                   readStruct(fb, 'i'),  # 122
            'experiment_type':                  readStruct(fb, 'h'),  # 126
            'manual_info_strategy':             readStruct(fb, 'h'),  # 128
            'comments_enable':                  readStruct(fb, 'h'),  # 130
            'file_comment_index':               readStruct(fb, 'i'),  # 132
            'auto_analyse_enable':              readStruct(fb, 'h'),  # 136
            'signal_type':                      readStruct(fb, 'h'),  # 138
            'digital_enable':                   readStruct(fb, 'h'),  # 140
            'active_dac_channel':               readStruct(fb, 'h'),  # 142
            'digital_holding':                  readStruct(fb, 'h'),  # 144
            'digital_inter_episode':            readStruct(fb, 'h'),  # 146
            'digital_dac_channel':              readStruct(fb, 'h'),  # 148
            'digital_train_active_logic':       readStruct(fb, 'h'),  # 150
            'stats_enable':                     readStruct(fb, 'h'),  # 152
            'statistics_clear_strategy':        readStruct(fb, 'h'),  # 154
            'level_hysteresis':                 readStruct(fb, 'h'),  # 156
            'time_hysteresis':                  readStruct(fb, 'i'),  # 158
            'allow_external_tags':              readStruct(fb, 'h'),  # 162
            'average_algorithm':                readStruct(fb, 'h'),  # 164
            'average_weighting':                readStruct(fb, 'f'),  # 166
            'undo_prompt_strategy':             readStruct(fb, 'h'),  # 170
            'trial_trigger_source':             readStruct(fb, 'h'),  # 172
            'statistics_display_strategy':      readStruct(fb, 'h'),  # 174
            'external_tag_type':                readStruct(fb, 'h'),  # 176
            'scope_trigger_out':                readStruct(fb, 'h'),  # 178
            'ltp_type':                         readStruct(fb, 'h'),  # 180
            'alternate_dac_output_state':       readStruct(fb, 'h'),  # 182
            'alternate_digital_output_state':   readStruct(fb, 'h'),  # 184
            'cell_id':                          readStruct(fb, '3f'), # 186
            'digitizer_adcs':                   readStruct(fb, 'h'),  # 198
            'digitizer_dacs':                   readStruct(fb, 'h'),  # 200
            'digitizer_total_digital_outs':     readStruct(fb, 'h'),  # 202
            'digitizer_synch_digital_outs':     readStruct(fb, 'h'),  # 204
            'digitizer_type':                   readStruct(fb, 'h')   # 206
        }

        if protocol['digitizer_type'] in range(len(DIGITIZERS)):
            protocol['digitizer_type'] = DIGITIZERS[protocol['digitizer_type']]
        else:
            protocol['digitizer_type'] = DIGITIZERS[0]

    with open(json_path, 'w') as jb:
        json.dump(protocol, jb, indent=4, sort_keys=True)
