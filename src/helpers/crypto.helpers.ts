import { Crypto } from 'users/dto/crypto-types.dto';

export const getCryptoSymbolByCryptoName = (currency) => {
  switch (currency) {
    case Crypto.BITCOIN:
      return 'BTC_TEST';
    case Crypto.ETHEREUM:
      return 'ETH_TEST';
    case Crypto.CELO:
      return '';
    default:
      return '';
  }
};
