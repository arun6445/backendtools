import {
  HttpException,
  HttpService,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { map } from 'rxjs/operators';
import { ConfigService } from '@nestjs/config';

import { DEFAULT_PAGE_SIZE } from 'app.constants';

import {
  CreateTransactionDto,
  CreateTransferDto,
  Transaction,
  Balance,
  TransactionsWithCount,
  RehiveRequestDto,
} from './dto';
import {
  PassbaseVerificationStatus,
  RehiveBalance,
  RehiveKYCStatus,
  RehiveResponseSuccess,
  RehiveTransaction,
  RehiveTransactionResponse,
  RehiveTransactionsFilterOptions,
  RehiveTransactionStatus,
  RehiveUser,
  TransactionsTotal,
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
    params,
  }: RehiveRequestDto): Promise<T> {
    const headers = { Authorization: `Token ${this.accessToken}` };
    return this.httpService
      .request<RehiveResponseSuccess<T>>({
        method,
        url: `${this.rehiveUrl}${url}`,
        headers,
        params,
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

  public async getTransactions(
    user: string,
    page?: number,
  ): Promise<TransactionsWithCount> {
    const {
      results: transactions,
      count,
    } = await this.sendRequestToRehive<RehiveTransactionResponse>({
      method: 'get',
      url: `/admin/transactions/`,
      params: {
        user,
        page,
        page_size: DEFAULT_PAGE_SIZE,
      },
    });

    return {
      transactions: transactions.map((transaction) =>
        Transaction.fromRehiveTransaction(transaction),
      ),
      count,
    };
  }

  async getTransactionsTotal(params: Partial<RehiveTransactionsFilterOptions>) {
    const transactionsTotal = await this.sendRequestToRehive<TransactionsTotal>(
      {
        method: 'get',
        url: '/admin/transactions/totals',
        params,
      },
    );

    return transactionsTotal;
  }

  async updateUserKYCStatus(userId: string, status: RehiveKYCStatus) {
    return this.sendRequestToRehive<{ status: RehiveKYCStatus }>({
      method: 'patch',
      url: `/admin/users/${userId}/kyc`,
      data: {
        status,
      },
    });
  }

  getRehiveStatus(status?: PassbaseVerificationStatus): RehiveKYCStatus {
    switch (status) {
      case 'pending':
        return 'pending';
      case 'approved':
        return 'verified';
      case 'declined':
        return 'declined';
      default:
        return 'incomplete';
    }
  }

  public updateTransactionStatus(
    transactionId: string,
    status: RehiveTransactionStatus,
  ) {
    return this.sendRequestToRehive({
      method: 'PATCH',
      url: `/admin/transactions/${transactionId}`,
      data: {
        status,
      },
    });
  }
}
