import { Injectable } from '@nestjs/common';
import { TransactionsWithCount } from 'rehive/dto';
import { RehiveTransactionsFilterOptions } from 'rehive/rehive.interfaces';
import RehiveService from 'rehive/rehive.service';

@Injectable()
export class TransactionsService {
  constructor(private rehiveService: RehiveService) {}

  getUserTransactions(
    userId: string,
    page: number,
  ): Promise<TransactionsWithCount> {
    return this.rehiveService.getTransactions(userId, page);
  }

  getUserTransactionTotal(
    userId: string,
    filterOptions: Partial<RehiveTransactionsFilterOptions>,
  ) {
    return this.rehiveService.getTransactionsTotal({
      user: userId,
      ...filterOptions,
    });
  }
}
