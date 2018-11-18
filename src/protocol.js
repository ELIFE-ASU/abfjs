const digitizers = [
    'Unknown',
    'Demo',
    'MiniDigi',
    'DD132X',
    'OPUS',
    'PATCH',
    'Digidata 1440',
    'MINIDIGI2',
    'Digidata 1550'
];

module.exports = function(data, section_map) {
    const read_unused = function(data, offset) {
        return [0,1,2].map((i) => String.fromCharCode(data[offset + i]));
    };

    const read_cell = function(data, offset) {
        let a = data.readFloatLE(offset + 0),
            b = data.readFloatLE(offset + 4),
            c = data.readFloatLE(offset + 8);

        return [a, b, c];
    };

    const block_size = 512;
    const offset = block_size * section_map.protocol_section[0];
    let protocol = {
        operation_mode:                   data.readInt16LE(offset + 0),
        adc_sequence_interval:            data.readFloatLE(offset + 2),
        enable_file_compression:          data.readInt8(offset + 6),
        unused:                           read_unused(data, offset + 7),
        file_compression_ratio:           data.readUInt32LE(offset + 10),
        synch_time_unit:                  data.readFloatLE(offset + 14),
        seconds_per_run:                  data.readFloatLE(offset + 18),
        num_samples_per_episode:          data.readInt32LE(offset + 22),
        pre_trigger_samples:              data.readInt32LE(offset + 26),
        episodes_per_run:                 data.readInt32LE(offset + 30),
        runs_per_trial:                   data.readInt32LE(offset + 34),
        num_trials:                       data.readInt32LE(offset + 38),
        averaging_mode:                   data.readInt16LE(offset + 42),
        undo_run_count:                   data.readInt16LE(offset + 44),
        first_episode_in_run:             data.readInt16LE(offset + 46),
        trigger_threshold:                data.readFloatLE(offset + 48),
        trigger_source:                   data.readInt16LE(offset + 52),
        trigger_action:                   data.readInt16LE(offset + 54),
        trigger_polarity:                 data.readInt16LE(offset + 56),
        scope_output_interval:            data.readFloatLE(offset + 58),
        episode_start_to_start:           data.readFloatLE(offset + 62),
        run_start_to_start:               data.readFloatLE(offset + 66),
        average_count:                    data.readInt32LE(offset + 70),
        trial_start_to_start:             data.readFloatLE(offset + 74),
        auto_trigger_strategy:            data.readInt16LE(offset + 78),
        first_run_delays:                 data.readFloatLE(offset + 80),
        channel_stats_strategy:           data.readInt16LE(offset + 84),
        samples_per_trace:                data.readInt32LE(offset + 86),
        start_display_num:                data.readInt32LE(offset + 90),
        finish_display_num:               data.readInt32LE(offset + 94),
        show_pn_raw_data:                 data.readInt16LE(offset + 98),
        statistics_period:                data.readFloatLE(offset + 100),
        statistics_measurements:          data.readInt32LE(offset + 104),
        statistics_save_strategy:         data.readInt16LE(offset + 108),
        adc_range:                        data.readFloatLE(offset + 110),
        dac_range:                        data.readFloatLE(offset + 114),
        adc_resolution:                   data.readInt32LE(offset + 118),
        dac_resolution:                   data.readInt32LE(offset + 122),
        experiment_type:                  data.readInt16LE(offset + 126),
        manual_info_strategy:             data.readInt16LE(offset + 128),
        comments_enable:                  data.readInt16LE(offset + 130),
        file_comment_index:               data.readInt32LE(offset + 132),
        auto_analyse_enable:              data.readInt16LE(offset + 136),
        signal_type:                      data.readInt16LE(offset + 138),
        digital_enable:                   data.readInt16LE(offset + 140),
        active_dac_channel:               data.readInt16LE(offset + 142),
        digital_holding:                  data.readInt16LE(offset + 144),
        digital_inter_episode:            data.readInt16LE(offset + 146),
        digital_dac_channel:              data.readInt16LE(offset + 148),
        digital_train_active_logic:       data.readInt16LE(offset + 150),
        stats_enable:                     data.readInt16LE(offset + 152),
        statistics_clear_strategy:        data.readInt16LE(offset + 154),
        level_hysteresis:                 data.readInt16LE(offset + 156),
        time_hysteresis:                  data.readInt32LE(offset + 158),
        allow_external_tags:              data.readInt16LE(offset + 162),
        average_algorithm:                data.readInt16LE(offset + 164),
        average_weighting:                data.readFloatLE(offset + 166),
        undo_prompt_strategy:             data.readInt16LE(offset + 170),
        trial_trigger_source:             data.readInt16LE(offset + 172),
        statistics_display_strategy:      data.readInt16LE(offset + 174),
        external_tag_type:                data.readInt16LE(offset + 176),
        scope_trigger_out:                data.readInt16LE(offset + 178),
        ltp_type:                         data.readInt16LE(offset + 180),
        alternate_dac_output_state:       data.readInt16LE(offset + 182),
        alternate_digital_output_state:   data.readInt16LE(offset + 184),
        cell_id:                          read_cell(data, offset + 186),
        digitizer_adcs:                   data.readInt16LE(offset + 198),
        digitizer_dacs:                   data.readInt16LE(offset + 200),
        digitizer_total_digital_outs:     data.readInt16LE(offset + 202),
        digitizer_synch_digital_outs:     data.readInt16LE(offset + 204),
    };

    let digitizer_type = data.readInt16LE(offset + 206);
    if (0 <= digitizer_type && digitizer_type < digitizers.length) {
        protocol.digitizer_type = digitizers[digitizer_type];
    } else {
        protocol.digitizer_type = digitizers[0];
    }

    return protocol;
};
