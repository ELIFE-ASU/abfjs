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

module.exports = function(data, section_map) {
    const block_size = 512;
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
