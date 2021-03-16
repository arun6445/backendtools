import {
  HttpException,
  HttpService,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Method } from 'axios';
import { map } from 'rxjs/operators';

interface CoinBaseRequst {
  path: string;
  method: Method;
}

@Injectable()
export default class CoinMarketCapService {
  private apikey;
  constructor(
    configService: ConfigService,
    private readonly httpService: HttpService,
  ) {
    this.apikey = configService.get<string>('COIN_MARKET_CAP_API_KEY');
  }

  public async makeRequest({ path, method }: CoinBaseRequst): Promise<any> {
    const options = {
      method,
      qs: {
        start: '1',
        limit: '5000',
        convert: 'USD',
      },
      headers: {
        'X-CMC_PRO_API_KEY': this.apikey,
      },
      json: true,
      gzip: true,
      value: 'BTC',
      url: `https://pro-api.coinmarketcap.com/v1/${path}`,
    };
    return this.httpService
      .request(options)
      .pipe(map(({ data: responseData }) => responseData.data))
      .toPromise();
  }

  public async getCryptoDynamic(symbol: string): Promise<string> {
    try {
      const data = await this.makeRequest({
        path: `cryptocurrency/quotes/latest?symbol=${symbol}`,
        method: 'get',
      });

      return data[symbol].quote['USD']['percent_change_24h'];
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
