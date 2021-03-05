import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  CreateVaultAssetResponse,
  FireblocksSDK,
  VaultAccountResponse,
} from 'fireblocks-sdk';
import { S3 } from 'aws-sdk';

import { getCryptoSymbolByCryptoName } from 'helpers/crypto.helpers';

@Injectable()
export default class FireblocksService {
  private fireblocks;
  constructor(
    private readonly configService: ConfigService,
    apiSecret: S3.Body,
  ) {
    const fireblocksApiKey = this.configService.get<string>(
      'FIREBLOCKS_API_KEY',
    );
    this.fireblocks = new FireblocksSDK(apiSecret.toString(), fireblocksApiKey);
  }

  public async createVaultAccount(name: string): Promise<VaultAccountResponse> {
    return this.fireblocks.createVaultAccount(name);
  }

  private async getVaultAcountByUsername(
    username: string,
  ): Promise<VaultAccountResponse> {
    const vaultAccounts = await this.fireblocks.getVaultAccounts();
    return vaultAccounts.find(({ name }) => name === username);
  }

  private async createAsset(
    vaultAccountId: string,
    assetId: string,
  ): Promise<CreateVaultAssetResponse> {
    if (!assetId) {
      throw new HttpException(
        {
          qrCode:
            'Unfortunately duniapay does not support your crypto currency yet, but we will consider adding it in the future.',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    return this.fireblocks.createVaultAsset(vaultAccountId, assetId);
  }

  public async getAssetId(username: string, crypto: string): Promise<string> {
    const account = await this.getVaultAcountByUsername(username);

    if (account) {
      const asset = account.assets.find(
        ({ id }) => id === getCryptoSymbolByCryptoName(crypto),
      );
      if (asset) {
        return asset.id;
      } else {
        const { id } = await this.createAsset(
          account.id,
          getCryptoSymbolByCryptoName(crypto),
        );

        return id;
      }
    } else {
      try {
        const newAccount = await this.createVaultAccount(username);
        const { id } = await this.createAsset(
          newAccount.id,
          getCryptoSymbolByCryptoName(crypto),
        );
        return id;
      } catch (e) {
        throw new HttpException(
          { qrCode: "Can't create new account. Please try later" },
          HttpStatus.BAD_REQUEST,
        );
      }
    }
  }

  public async getBalanceAssetVaultAccount(
    username: string,
    currency: string,
  ): Promise<string> {
    const account = await this.getVaultAcountByUsername(username);
    if (!account) return '0';
    try {
      const vaultAsset = await this.fireblocks.getVaultAccountAsset(
        account.id,
        getCryptoSymbolByCryptoName(currency),
      );
      if (vaultAsset?.assets) return '0';
      return vaultAsset.available;
    } catch (e) {
      return '0';
    }
  }
}
