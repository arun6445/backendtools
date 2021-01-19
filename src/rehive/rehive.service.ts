import {
  HttpException,
  HttpService,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { map } from 'rxjs/operators';
import { ConfigService } from '@nestjs/config';

import { RehiveRequestDto } from 'rehive/dto/rehive.dto';
import {
  CreateTransactionDto,
  CreateTransferDto,
  Transaction,
  Balance,
} from 'rehive/dto';
import {
  RehiveBalance,
  RehiveResponseSuccess,
  RehiveTransaction,
  RehiveUser,
} from './rehive.interfaces';

@Injectable()
export default class RehiveService {
  rehiveUrl: string;
  accessToken: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.accessToken = this.configService.get<string>('REHIVE_ACCESS_TOKEN');
    this.rehiveUrl = this.configService.get<string>('REHIVE_URL');
  }

  private sendRequestToRehive<T>({
    method,
    url,
    data,
  }: RehiveRequestDto): Promise<T> {
    const headers = { Authorization: `Token ${this.accessToken}` };
    return this.httpService
      .request<RehiveResponseSuccess<T>>({
        method,
        url: `${this.rehiveUrl}${url}`,
        headers,
        data,
      })
      .pipe(map(({ data: responseData }) => responseData.data))
      .toPromise();
  }

  public createUser(): Promise<RehiveUser> {
    try {
      const userData = this.sendRequestToRehive<RehiveUser>({
        method: 'post',
        url: '/admin/users',
      });

      return userData;
    } catch (e) {
      throw new HttpException(
        { credentials: e.response.data.message },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  public async credit(
    userId: string,
    data: CreateTransactionDto,
  ): Promise<Transaction> {
    const transaction = await this.sendRequestToRehive<RehiveTransaction>({
      method: 'post',
      url: '/admin/transactions/credit',
      data: {
        ...data,
        user: userId,
      },
    });

    return Transaction.fromRehiveTransaction(transaction);
  }

  public async debit(
    userId: string,
    data: CreateTransactionDto,
  ): Promise<Transaction> {
    const transaction = await this.sendRequestToRehive<RehiveTransaction>({
      method: 'post',
      url: '/admin/transactions/debit',
      data: {
        ...data,
        user: userId,
      },
    });

    return Transaction.fromRehiveTransaction(transaction);
  }

  public async transfer(
    userId: string,
    data: CreateTransferDto,
  ): Promise<Transaction> {
    const transaction = await this.sendRequestToRehive<RehiveTransaction>({
      method: 'post',
      url: '/admin/transactions/transfer',
      data: {
        ...data,
        user: userId,
      },
    });

    return Transaction.fromRehiveTransaction(transaction);
  }

  public async getBalance(
    accountReference: string,
    currency = 'XOF',
  ): Promise<Balance> {
    const balance = await this.sendRequestToRehive<RehiveBalance>({
      method: 'get',
      url: `/admin/accounts/${accountReference}/currencies/${currency}`,
    });

    return Balance.fromRehiveBalanceDto(balance);
  }

  public async getTransactions(userId): Promise<Transaction[]> {
    const transactions = await this.sendRequestToRehive<RehiveTransaction[]>({
      method: 'get',
      url: `/admin/transactions/?user=${userId}`,
    });

    return transactions.map((transaction) =>
      Transaction.fromRehiveTransaction(transaction),
    );
  }
}
