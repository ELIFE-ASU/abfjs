module.exports = function(data, section_map) {
    const block_size = 512;
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
