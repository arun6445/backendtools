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

interface CryptoPair {
  isBuyCrypto: boolean;
  fiatCurrency: string;
  cryptoCurrency: string;
}

export const getCryptoCoinbasePair = ({
  isBuyCrypto,
  fiatCurrency,
  cryptoCurrency,
}: CryptoPair): string => {
  switch (cryptoCurrency) {
    case Crypto.BITCOIN:
      return isBuyCrypto ? `BTC-${fiatCurrency}` : `${fiatCurrency}-BTC`;
    case Crypto.ETHEREUM:
      return isBuyCrypto ? `ETH-${fiatCurrency}` : `${fiatCurrency}-ETH`;
    case Crypto.CELO:
      return isBuyCrypto ? `CGLD-${fiatCurrency}` : `${fiatCurrency}-CGLD`;
    default:
      return '';
  }
};

export const getCryptoSymbol = (currency) => {
  switch (currency) {
    case Crypto.BITCOIN:
      return 'BTC';
    case Crypto.ETHEREUM:
      return 'ETH';
    case Crypto.CELO:
      return 'CELO';
    default:
      return '';
  }
};
