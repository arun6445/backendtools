export enum IntouchProvider {
  ORANGE = 'ORANGE',
  MOOV = 'MOOV',
  TELECEL = 'TELECEL',
}

export const INTOUCH_SERVICE = {
  [IntouchProvider.ORANGE]: {
    CASHIN: 'BF_PAIEMENTMARCHAND_OM',
    AIRTIME: 'BF_AIRTIME_ORANGE',
  },
  [IntouchProvider.TELECEL]: {
    CASHIN: '',
    AIRTIME: 'BF_AIRTIME_TELECEL',
  },
  [IntouchProvider.MOOV]: {
    CASHIN: 'CASHINMOOV',
    AIRTIME: 'AIRTIMEMOOV',
  },
};
