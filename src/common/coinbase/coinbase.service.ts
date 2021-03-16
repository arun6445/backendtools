import {
  HttpException,
  HttpService,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { createHash } from 'crypto';
import { ConfigService } from '@nestjs/config';
import { Method } from 'axios';
import { map } from 'rxjs/operators';

interface CoinbaseRequst {
  path: string;
  method: Method;
}

@Injectable()
export default class Coinbase {
  private apikey;
  private coinBasePercentExchange;
  constructor(
    configService: ConfigService,
    private readonly httpService: HttpService,
  ) {
    this.apikey = configService.get<string>('COINBASE_API_KEY');
    this.coinBasePercentExchange = configService.get<string>(
      'COINBASE_PERCENT_EXCHANGE',
    );
  }
  public async makeRequest({ path, method }: CoinbaseRequst): Promise<any> {
    const timestamp = Number(Math.floor(Date.now() / 1000));
    const message = timestamp + method + path + '';

    const signature = createHash('sha256').update(message).digest('hex');

    const options = {
      method,
      headers: {
        'CB-ACCESS-SIGN': signature,
        'CB-ACCESS-KEY': this.apikey,
        'CB-VERSION': '2015-07-22',
      },
      json: true,
      url: `https://api.coinbase.com/v2/${path}`,
    };

    return this.httpService
      .request(options)
      .pipe(map(({ data: responseData }) => responseData.data))
      .toPromise();
  }

  private countPriceWithoutCoinbasePercent(
    priceWithPercentCoinBase: number,
  ): number {
    return Number(
      (
        (priceWithPercentCoinBase * 100) /
        (100 + Number(this.coinBasePercentExchange))
      ).toFixed(2),
    );
  }

  public async getBuyPrice(currencyPair: string): Promise<number> {
    try {
      const { amount } = await this.makeRequest({
        path: `prices/${currencyPair}/buy`,
        method: 'get',
      });
      return this.countPriceWithoutCoinbasePercent(amount);
    } catch (e) {
      throw new HttpException(
        {
          exchangeRate:
            'The data in this screen is outdated. Please reload duniapay',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  public async getSellPrice(currencyPair: string): Promise<number> {
    try {
      const { amount } = await this.makeRequest({
        path: `prices/${currencyPair}/sell`,
        method: 'get',
      });
      return this.countPriceWithoutCoinbasePercent(amount);
    } catch (e) {
      throw new HttpException(
        {
          exchangeRate:
            'The data in this screen is outdated. Please reload duniapay',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
