export enum IntouchProvider {
  ORANGE = 'ORANGE',
  MOOV = 'MOOV',
  TELECEL = 'TELECEL',
}

export const PARTNER_ID = 'BF1163';

export const INTOUCH_SERVICE = {
  [IntouchProvider.ORANGE]: {
    CASHIN: 'BF_PAIEMENTMARCHAND_OM',
    CASHOUT: 'BF_CASHIN_OM',
    AIRTIME: 'BF_AIRTIME_ORANGE',
  },
  [IntouchProvider.TELECEL]: {
    CASHIN: '',
    CASHOUT: '',
    AIRTIME: 'BF_AIRTIME_TELECEL',
  },
  [IntouchProvider.MOOV]: {
    CASHIN: 'BF_PAIEMENTMARCHAND_MOBICASH',
    CASHOUT: 'BF_CASHIN_MOBICASH',
    AIRTIME: 'BF_AIRTIME_TELMOB',
  },
};
