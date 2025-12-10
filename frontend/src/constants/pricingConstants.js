export const PRICING_FIELDS_BY_PRODUCT = {
  did: ['nrc', 'mrc', 'ppm'],
  freephone: ['nrc', 'mrc', 'ppm_fix', 'ppm_mobile', 'ppm_payphone'],
  univ_freephone: ['nrc', 'mrc', 'ppm_fix', 'ppm_mobile', 'ppm_payphone'],
  two_way_voice: ['nrc', 'mrc', 'incoming_ppm', 'outgoing_ppm_fix', 'outgoing_ppm_mobile'],
  two_way_sms: ['nrc', 'mrc', 'arc', 'mo', 'mt'],
  mobile: ['nrc', 'mrc', 'incoming_ppm', 'outgoing_ppm_fix', 'outgoing_ppm_mobile', 'incoming_sms', 'outgoing_sms']
};

export const PRICING_FIELD_LABELS = {
  nrc: 'NRC',
  mrc: 'MRC',
  ppm: 'PPM',
  ppm_fix: 'PPM Fix',
  ppm_mobile: 'PPM Mobile',
  ppm_payphone: 'PPM Payphone',
  arc: 'ARC',
  mo: 'MO',
  mt: 'MT',
  incoming_ppm: 'Incoming PPM',
  outgoing_ppm_fix: 'Outgoing Fix PPM',
  outgoing_ppm_mobile: 'Outgoing Mobile PPM',
  incoming_sms: 'Incoming SMS',
  outgoing_sms: 'Outgoing SMS'
};

export const PRICING_HEADINGS = {
  did: { nrc: 'NRC', mrc: 'MRC', ppm: 'PPM' },
  freephone: {
    nrc: 'NRC',
    mrc: 'MRC',
    ppm_fix: 'PPM Fix',
    ppm_mobile: 'PPM Mobile',
    ppm_payphone: 'PPM Payphone',
  },
  univ_freephone: {
    nrc: 'NRC',
    mrc: 'MRC',
    ppm_fix: 'PPM Fix',
    ppm_mobile: 'PPM Mobile',
    ppm_payphone: 'PPM Payphone',
  },
  two_way_voice: {
    nrc: 'NRC',
    mrc: 'MRC',
    incoming_ppm: 'Incoming PPM',
    outgoing_ppm_fix: 'Outgoing Fix PPM',
    outgoing_ppm_mobile: 'Outgoing Mobile PPM',
  },
  two_way_sms: { nrc: 'NRC', mrc: 'MRC', arc: 'ARC', mo: 'MO', mt: 'MT' },
  mobile: {
    nrc: 'NRC',
    mrc: 'MRC',
    incoming_ppm: 'Incoming PPM',
    outgoing_ppm_fix: 'Outgoing Fix PPM',
    outgoing_ppm_mobile: 'Outgoing Mobile PPM',
    incoming_sms: 'Incoming SMS',
    outgoing_sms: 'Outgoing SMS',
  },
};
