import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { CryptoDocument } from 'crypto/model';
import CoinMarketCapService from 'common/coinmarketcap/coin-market-cap.service';

@Injectable()
export default class CryptoService {
  constructor(
    @InjectModel(CryptoDocument.name)
    private readonly cryptoModel: Model<CryptoDocument>,
    private readonly coinMarketCapService: CoinMarketCapService,
  ) {}

  public async getCryptoDinamic(
    crypto: string,
    cryptoSymbol: string,
  ): Promise<string> {
    const oldDate = new Date(Date.now() - 4 * 60 * 60 * 1000);
    const cryptoMongo = await this.cryptoModel.findOne({
      cryptoName: crypto,
      requestDate: { $gte: oldDate },
    });

    if (cryptoMongo) {
      return cryptoMongo.dynamic.toFixed(2);
    } else {
      const dynamic = await this.coinMarketCapService.getCryptoDynamic(
        cryptoSymbol,
      );
      await this.cryptoModel.findOneAndUpdate(
        { cryptoName: crypto },
        { requestDate: new Date(), dynamic: Number(dynamic) },
        { new: true, upsert: true },
      );

      return Number(dynamic).toFixed(2);
    }
  }
}
