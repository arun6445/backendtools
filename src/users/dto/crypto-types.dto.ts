import { IsEnum } from 'class-validator';

export enum Crypto {
  BITCOIN = 'bitcoin',
  CELO = 'celo',
  ETHEREUM = 'ethereum',
}

export class CryptoTypesDto {
  @IsEnum(Crypto)
  cryptoType: Crypto;
}
