const block_size = 512;

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

const telegraphs = [
    'Unknown instrument (manual or user defined telegraph table).',
    'Axopatch-1 with CV-4-1/100',
    'Axopatch-1 with CV-4-0.1/100',
    'Axopatch-1B(inv.) CV-4-1/100',
    'Axopatch-1B(inv) CV-4-0.1/100',
    'Axopatch 200 with CV 201',
    'Axopatch 200 with CV 202',
    'GeneClamp',
    'Dagan 3900',
    'Dagan 3900A',
    'Dagan CA-1  Im=0.1',
    'Dagan CA-1  Im=1.0',
    'Dagan CA-1  Im=10',
    'Warner OC-725',
    'Warner OC-725',
    'Axopatch 200B',
    'Dagan PC-ONE  Im=0.1',
    'Dagan PC-ONE  Im=1.0',
    'Dagan PC-ONE  Im=10',
    'Dagan PC-ONE  Im=100',
    'Warner BC-525C',
    'Warner PC-505',
    'Warner PC-501',
    'Dagan CA-1  Im=0.05',
    'MultiClamp 700',
    'Turbo Tec',
    'OpusXpress 6000A',
    'Axoclamp 900'
];

const Header = function(data) {
    let header = {
        signature: data.toString('utf8', 0, 4),
        version_number: data.slice(4, 8),
        info_size: data.readUInt32LE(8),
        actual_episodes: data.readUInt32LE(12),
        start_date: data.readUInt32LE(16),
        start_time_ms: data.readUInt32LE(20),
        stopwatch_time: data.readUInt32LE(24),
        filetype: data.readUInt16LE(28),
        data_format: data.readUInt16LE(30),
        simultaneous_scan: data.readUInt16LE(32),
        crc_enable: data.readUInt16LE(34),
        file_crc: data.readUInt32LE(36),
        file_guid: data.slice(40, 56),
        creator_version: data.slice(56, 60),
        creator_name_index: data.readUInt32LE(60),
        modifier_version: data.readUInt32LE(64),
        modifier_name_index: data.readUInt32LE(68),
        protocol_path_index: data.readUInt32LE(72)
    };

    let version_parts_int = Buffer.from(header.version_number).reverse(),
        version_parts = version_parts_int.map((x) => x.toString());
    header.version_string = version_parts.join('.');
    header.version_float = parseFloat(version_parts.join(''))/1000.0;
    header.version = {
        major: version_parts_int[0],
        minor: version_parts_int[1],
        bugfix: version_parts_int[2],
        build: version_parts_int[3]
    };

    version_parts_int = Buffer.from(header.creator_version).reverse();
    version_parts = version_parts_int.map((x) => x.toString());
    header.creator_string = version_parts.join('.');
    header.creator_float = parseFloat(version_parts.join(''))/1000.0;
    header.creator = {
        major: version_parts_int[0],
        minor: version_parts_int[1],
        bugfix: version_parts_int[2],
        build: version_parts_int[3]
    };

    let guid = [];
    [3, 2, 1, 0, 5, 4, 7, 6, 8, 9, 10, 11, 12, 13, 15, 15].forEach((i) => {
        guid.push(('00' + header.file_guid[i].toString(16)).substr(-2));
    });
    [4, 7, 10, 13].forEach((i) => {
        guid.splice(i, 0, '-');
    });
    header.guid = `{${guid.join('')}}`.toUpperCase();

    let year = Math.floor(header.start_date / 10000),
        month = Math.floor((header.start_date - 10000*year) / 100),
        day = header.start_date - 10000*year - 100*month,
        date = new Date(year, month - 1, day, 0, 0, 0, header.start_time_ms),
        tzone = date.getTimezoneOffset();
    header.date_time = new Date(date.getTime() - tzone * 60000).toISOString();

    return header;
};

const SectionMap = function(data) {
    const read_section = function(data, offset) {
        let pos = data.readUInt32LE(offset),
            size = data.readUInt32LE(offset + 4),
            count = data.readUInt32LE(offset + 8);
        return [pos, size, count];
    };

    let section_map = {
        protocol_section:       read_section(data, 76),
        adc_section:            read_section(data, 92),
        dac_section:            read_section(data, 108),
        epoch_section:          read_section(data, 124),
        adc_per_dac_section:    read_section(data, 140),
        epoch_per_dac_section:  read_section(data, 156),
        user_list_section:      read_section(data, 172),
        stats_region_section:   read_section(data, 188),
        math_section:           read_section(data, 204),
        strings_section:        read_section(data, 220),
        data_section:           read_section(data, 236),
        tag_section:            read_section(data, 252),
        scope_section:          read_section(data, 268),
        delta_section:          read_section(data, 284),
        voice_tag_section:      read_section(data, 300),
        synch_array_section:    read_section(data, 316),
        annotation_section:     read_section(data, 332),
        stats_section:          read_section(data, 348)
    };

    return section_map;
};

const Protocol = function(data, section_map) {
    const read_unused = function(data, offset) {
        return [0,1,2].map((i) => String.fromCharCode(data[offset + i]));
    };

    const read_cell = function(data, offset) {
        let a = data.readFloatLE(offset + 0),
            b = data.readFloatLE(offset + 4),
            c = data.readFloatLE(offset + 8);

        return [a, b, c];
    };

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

const ADC = function(data, section_map) {
    const [pos, size, count] = section_map.adc_section;

    let offset = block_size * pos;
    let adc = {
        adc_num:                          new Array(count),       
        telegraph_enable:                 new Array(count),       
        telegraph_instrument:             new Array(count),       
        telegraph_addit_gain:             new Array(count),       
        telegraph_filter:                 new Array(count),
        telegraph_membrane_cap:           new Array(count),
        telegraph_mode:                   new Array(count),
        telegraph_access_resistance:      new Array(count),
        adc_p_to_l_channel_map:           new Array(count),
        adc_sampling_sequence:            new Array(count),
        adc_programmable_gain:            new Array(count),
        adc_display_amplification:        new Array(count),
        adc_display_offset:               new Array(count),
        instrument_scale_factor:          new Array(count),
        instrument_offset:                new Array(count),
        signal_gain:                      new Array(count),
        signal_offset:                    new Array(count),
        signal_lowpass_filter:            new Array(count),
        signal_highpass_filter:           new Array(count),
        lowpass_filter_type:              new Array(count),
        highpass_filter_type:             new Array(count),
        post_process_lowpass_filter:      new Array(count),
        post_process_lowpass_filter_type: new Array(count),
        enabled_during_pn:                new Array(count),
        stats_channel_polarity:           new Array(count),
        adc_channel_name_index:           new Array(count),
        adc_units_index:                  new Array(count)
    };

    for (let i = 0; i < count; ++i) {
        adc.adc_num[i]                           = data.readInt16LE(offset + 0);
        adc.telegraph_enable[i]                  = data.readInt16LE(offset + 2);
        adc.telegraph_instrument[i]              = data.readInt16LE(offset + 4);
        adc.telegraph_addit_gain[i]              = data.readFloatLE(offset + 6);
        adc.telegraph_filter[i]                  = data.readFloatLE(offset + 10);
        adc.telegraph_membrane_cap[i]            = data.readFloatLE(offset + 14);
        adc.telegraph_mode[i]                    = data.readInt16LE(offset + 18);
        adc.telegraph_access_resistance[i]       = data.readFloatLE(offset + 20);
        adc.adc_p_to_l_channel_map[i]            = data.readInt16LE(offset + 24);
        adc.adc_sampling_sequence[i]             = data.readInt16LE(offset + 26);
        adc.adc_programmable_gain[i]             = data.readFloatLE(offset + 28);
        adc.adc_display_amplification[i]         = data.readFloatLE(offset + 32);
        adc.adc_display_offset[i]                = data.readFloatLE(offset + 36);
        adc.instrument_scale_factor[i]           = data.readFloatLE(offset + 40);
        adc.instrument_offset[i]                 = data.readFloatLE(offset + 44);
        adc.signal_gain[i]                       = data.readFloatLE(offset + 48);
        adc.signal_offset[i]                     = data.readFloatLE(offset + 52);
        adc.signal_lowpass_filter[i]             = data.readFloatLE(offset + 56);
        adc.signal_highpass_filter[i]            = data.readFloatLE(offset + 60);
        adc.lowpass_filter_type[i]               = data.readInt8(offset + 64);
        adc.highpass_filter_type[i]              = data.readInt8(offset + 65);
        adc.post_process_lowpass_filter[i]       = data.readFloatLE(offset + 66);
        adc.post_process_lowpass_filter_type[i]  = String.fromCharCode(data[offset + 70]);
        adc.enabled_during_pn[i]                 = data.readInt8(offset + 71);
        adc.stats_channel_polarity[i]            = data.readInt16LE(offset + 72);
        adc.adc_channel_name_index[i]            = data.readInt32LE(offset + 74);
        adc.adc_units_index[i]                   = data.readInt32LE(offset + 78);

        let instrument = adc.telegraph_instrument[i];
        if (0 <= instrument && instrument < telegraphs.length) {
            adc.telegraph_instrument[i] = telegraphs[instrument];
        } else {
            adc.telegraph_instrument[i] = telegraphs[0];
        }

        offset += size;
    }

    return adc;
};

const DAC = function(data, section_map) {
    const [pos, size, count] = section_map.dac_section;

    let offset = block_size * pos;
    let dac = {
        dac_num:                              new Array(count),
        telegraph_dac_scale_factor_enable:    new Array(count),
        instrument_holding_level:             new Array(count),
        dac_scale_factor:                     new Array(count),
        dac_holding_level:                    new Array(count),
        dac_calibration_factor:               new Array(count),
        dac_calibration_offset:               new Array(count),
        dac_channel_name_index:               new Array(count),
        dac_channel_units_index:              new Array(count),
        dac_file_ptr:                         new Array(count),
        dac_file_num_episodes:                new Array(count),
        waveform_enable:                      new Array(count),
        waveform_source:                      new Array(count),
        inter_episode_level:                  new Array(count),
        dac_file_scale:                       new Array(count),
        dac_file_offset:                      new Array(count),
        dac_file_episode_num:                 new Array(count),
        dac_file_adc_num:                     new Array(count),
        condit_enable:                        new Array(count),
        condit_num_pulses:                    new Array(count),
        baseline_duration:                    new Array(count),
        baseline_level:                       new Array(count),
        step_duration:                        new Array(count),
        step_level:                           new Array(count),
        post_train_period:                    new Array(count),
        post_train_level:                     new Array(count),
        memb_test_enable:                     new Array(count),
        leak_subtract_type:                   new Array(count),
        pn_polarity:                          new Array(count),
        pn_holding_level:                     new Array(count),
        pn_num_adc_channels:                  new Array(count),
        pn_position:                          new Array(count),
        pn_num_pulses:                        new Array(count),
        pn_settling_time:                     new Array(count),
        pn_interpulse:                        new Array(count),
        ltp_usage_of_dac:                     new Array(count),
        ltp_presynaptic_pulses:               new Array(count),
        dac_file_path_index:                  new Array(count),
        memb_test_pre_settling_time_ms:       new Array(count),
        memb_test_post_settling_time_ms:      new Array(count),
        leak_subtract_adc_index:              new Array(count)
    };

    for (let i = 0; i < count; ++i) {
        dac.dac_num[i]                           = data.readInt16LE(offset + 0);
        dac.telegraph_dac_scale_factor_enable[i] = data.readInt16LE(offset + 2);
        dac.instrument_holding_level[i]          = data.readFloatLE(offset + 4);
        dac.dac_scale_factor[i]                  = data.readFloatLE(offset + 8);
        dac.dac_holding_level[i]                 = data.readFloatLE(offset + 12);
        dac.dac_calibration_factor[i]            = data.readFloatLE(offset + 16);
        dac.dac_calibration_offset[i]            = data.readFloatLE(offset + 20);
        dac.dac_channel_name_index[i]            = data.readInt32LE(offset + 24);
        dac.dac_channel_units_index[i]           = data.readInt32LE(offset + 28);
        dac.dac_file_ptr[i]                      = data.readInt32LE(offset + 32);
        dac.dac_file_num_episodes[i]             = data.readInt32LE(offset + 36);
        dac.waveform_enable[i]                   = data.readInt16LE(offset + 40);
        dac.waveform_source[i]                   = data.readInt16LE(offset + 42);
        dac.inter_episode_level[i]               = data.readInt16LE(offset + 44);
        dac.dac_file_scale[i]                    = data.readFloatLE(offset + 46);
        dac.dac_file_offset[i]                   = data.readFloatLE(offset + 50);
        dac.dac_file_episode_num[i]              = data.readInt32LE(offset + 54);
        dac.dac_file_adc_num[i]                  = data.readInt16LE(offset + 58);
        dac.condit_enable[i]                     = data.readInt16LE(offset + 60);
        dac.condit_num_pulses[i]                 = data.readInt32LE(offset + 62);
        dac.baseline_duration[i]                 = data.readFloatLE(offset + 66);
        dac.baseline_level[i]                    = data.readFloatLE(offset + 70);
        dac.step_duration[i]                     = data.readFloatLE(offset + 74);
        dac.step_level[i]                        = data.readFloatLE(offset + 78);
        dac.post_train_period[i]                 = data.readFloatLE(offset + 82);
        dac.post_train_level[i]                  = data.readFloatLE(offset + 86);
        dac.memb_test_enable[i]                  = data.readInt16LE(offset + 90);
        dac.leak_subtract_type[i]                = data.readInt16LE(offset + 92);
        dac.pn_polarity[i]                       = data.readInt16LE(offset + 94);
        dac.pn_holding_level[i]                  = data.readFloatLE(offset + 96);
        dac.pn_num_adc_channels[i]               = data.readInt16LE(offset + 100);
        dac.pn_position[i]                       = data.readInt16LE(offset + 102);
        dac.pn_num_pulses[i]                     = data.readInt16LE(offset + 104);
        dac.pn_settling_time[i]                  = data.readFloatLE(offset + 106);
        dac.pn_interpulse[i]                     = data.readFloatLE(offset + 110);
        dac.ltp_usage_of_dac[i]                  = data.readInt16LE(offset + 114);
        dac.ltp_presynaptic_pulses[i]            = data.readInt16LE(offset + 116);
        dac.dac_file_path_index[i]               = data.readInt32LE(offset + 118);
        dac.memb_test_pre_settling_time_ms[i]    = data.readFloatLE(offset + 122);
        dac.memb_test_post_settling_time_ms[i]   = data.readFloatLE(offset + 126);
        dac.leak_subtract_adc_index[i]           = data.readInt16LE(offset + 130);

        offset += size;
    }

    return dac;
};

const Epoch = function(data, section_map) {
    const [pos, size, count] = section_map.epoch_section;

    let offset = block_size * pos;
    let epoch = {
        epoch_num:            new Array(count),
        epoch_digital_output: new Array(count)
    };

    for (let i = 0; i < count; ++i) {
        epoch.epoch_num[i]             = data.readInt16LE(offset + 0);
        epoch.epoch_digital_output[i]  = data.readInt16LE(offset + 2);

        offset += size;
    }

    return epoch;
};

const EpochPerDAC = function(data, section_map) {
    const [pos, size, count] = section_map.epoch_per_dac_section;

    let offset = block_size * pos;
    let epoch_per_dac = {
        epoch_num:            new Array(count),
        dac_num:              new Array(count),
        epoch_type:           new Array(count),
        epoch_init_level:     new Array(count),
        epoch_level_inc:      new Array(count),
        epoch_init_duration:  new Array(count),
        epoch_duration_inc:   new Array(count),
        epoch_pulse_period:   new Array(count),
        epoch_pulse_width:    new Array(count)
    };

    for (let i = 0; i < count; ++i) {
        epoch_per_dac.epoch_num[i]             = data.readInt16LE(offset + 0);
        epoch_per_dac.dac_num[i]               = data.readInt16LE(offset + 2);
        epoch_per_dac.epoch_type[i]            = data.readInt16LE(offset + 4);
        epoch_per_dac.epoch_init_level[i]      = data.readFloatLE(offset + 6);
        epoch_per_dac.epoch_level_inc[i]       = data.readFloatLE(offset + 10);
        epoch_per_dac.epoch_init_duration[i]   = data.readInt32LE(offset + 14);
        epoch_per_dac.epoch_duration_inc[i]    = data.readInt32LE(offset + 18);
        epoch_per_dac.epoch_pulse_period[i]    = data.readInt32LE(offset + 22);
        epoch_per_dac.epoch_pulse_width[i]     = data.readInt32LE(offset + 26);

        offset += size;
    }

    return epoch_per_dac;
};

const Tag = function(data, section_map) {
    const [pos, size, count] = section_map.tag_section;

    let offset = block_size * pos;
    let tag = {
        tag_time:   new Array(count),
        comment:    new Array(count),
        tag_type:   new Array(count),
        tag_number: new Array(count)
    };

    for (let i = 0; i < count; ++i) {
        tag.tag_time[i]     = data.readInt32LE(offset + 0);
        tag.comment[i]      = data.toString('utf8', offset + 4, offset + 60);
        tag.tag_type[i]     = data.readInt16LE(offset + 60);
        tag.tag_number[i]   = data.readInt16LE(offset + 62);

        offset += size;
    }

    return tag;
};

const Strings = function(data, section_map) {
    const [pos, size, count] = section_map.strings_section;

    let offset = block_size * pos;
    let strings = {
        strings: new Array(count)
    };

    for (let i = 0; i < count; ++i) {
        strings.strings[i] = data.toString('hex', offset, offset + size);
        offset += size;
    }

    return strings;
};

const IndexedStrings = function(header, protocol, adc, dac, strings) {
    let buffer = Buffer.from(strings.strings[0], 'hex'),
        start = buffer.lastIndexOf('\x00\x00'),
        indexed = new Array();

    for (let stop = start + 1; stop != buffer.length; ++stop) {
        if (buffer[stop] == 0) {
            indexed.push(buffer.toString('utf-8', start + 1, stop).trim());
            start = stop;
        }
    }

    let indexed_strings = {
        header: {
            creator_name:  indexed[header.creator_name_index],
            modifier_name: indexed[header.modifier_name_index],
            protocol_path: indexed[header.protocol_path_index]
        },
        protocol: {
            file_comment: indexed[protocol.file_comment_index]
        },
        adc: {
            adc_channel_name: [],
            adc_units:        []
        },
        dac: {
            dac_channel_name:  [],
            dac_channel_units: [],
            dac_file_path:     [],
            leak_subtract_adc: []
        }
    };

    for (let i = 0; i < adc.adc_channel_name_index.length; ++i) {
        indexed_strings.adc.adc_channel_name.push(
            indexed[adc.adc_channel_name_index[i]]);
        indexed_strings.adc.adc_units.push(
            indexed[adc.adc_units_index[i]]);
    }

    for (let i = 0; i < dac.dac_channel_name_index.length; ++i) {
        indexed_strings.dac.dac_channel_name.push(
            indexed[dac.dac_channel_name_index[i]]);
        indexed_strings.dac.dac_channel_units.push(
            indexed[dac.dac_channel_units_index[i]]);
        indexed_strings.dac.dac_file_path.push(
            indexed[dac.dac_file_path_index[i]]);
        indexed_strings.dac.leak_subtract_adc.push(
            indexed[dac.leak_subtract_adc_index[i]]);
    }

    return indexed_strings;
};

module.exports = function(data) {
    const header          = Header(data);
    const section_map     = SectionMap(data);
    const protocol        = Protocol(data, section_map);
    const adc             = ADC(data, section_map);
    const dac             = DAC(data, section_map);
    const epoch           = Epoch(data, section_map);
    const epochperdac     = EpochPerDAC(data, section_map);
    const tag             = Tag(data, section_map);
    const strings         = Strings(data, section_map);
    const indexed_strings = IndexedStrings(header, protocol, adc, dac, strings);

    return {
        header,
        section_map,
        protocol,
        adc,
        dac,
        epoch,
        epochperdac,
        tag,
        strings,
        indexed_strings
    };
};
