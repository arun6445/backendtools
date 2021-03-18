import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { IntouchWebhookResponse } from 'common/intouch/dto';
import InTouchService from 'common/intouch/intouch.service';
import {
  WithdrawalDto,
  CreateTransactionDto,
  CreateTransferDto,
  MobileDepositDto,
  TransactionsWithCount,
} from 'common/rehive/dto';
import {
  RehiveTransactionsFilterOptions,
  RehiveTransactionStatus,
} from 'common/rehive/rehive.interfaces';
import RehiveService from 'common/rehive/rehive.service';
import FirebaseService from 'common/firebase/firebase.service';
import { UsersService } from 'users/users.service';

@Injectable()
export class TransactionsService {
  constructor(
    private readonly rehiveService: RehiveService,
    private readonly intouchService: InTouchService,
    private readonly firebaseService: FirebaseService,
    @Inject(forwardRef(() => UsersService))
    private usersService: UsersService,
  ) {}

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

  credit(userId: string, transactionData: CreateTransactionDto) {
    return this.rehiveService.credit(userId, transactionData);
  }

  debit(userId: string, transactionData: CreateTransactionDto) {
    return this.rehiveService.debit(userId, transactionData);
  }

  transfer(userId: string, transferData: CreateTransferDto) {
    return this.rehiveService.transfer(userId, transferData);
  }

  async mobileMoneyDeposit(data: MobileDepositDto) {
    const { userId, amount, provider, otp, phoneNumber } = data;
    const deposit = await this.rehiveService.credit(userId, data);

    const formattedPhoneNumber = phoneNumber.replace('+226', '');

    try {
      const intouchTransaction = await this.intouchService.collectFundsFromMobileMoney(
        deposit.id,
        amount,
        provider,
        formattedPhoneNumber,
        otp,
      );

      return intouchTransaction;
    } catch (e) {
      await this.rehiveService.updateTransactionStatus(deposit.id, 'Failed');
      throw e;
    }
  }

  processIntouchTransaction({
    status,
    partnerTransactionId,
  }: IntouchWebhookResponse) {
    const rehiveStatus: RehiveTransactionStatus =
      status === 'SUCCESSFUL' ? 'Complete' : 'Failed';

    return this.rehiveService.updateTransactionStatus(
      partnerTransactionId,
      rehiveStatus,
    );
  }

  async buyAirtime(airtimeData: WithdrawalDto) {
    const {
      userId,
      provider,
      phoneNumber,
      amount,
      status,
      currency,
    } = airtimeData;
    const debit = await this.rehiveService.debit(userId, {
      amount,
      status,
      currency,
    });

    const formattedPhoneNumber = phoneNumber.replace('+226', '');

    try {
      const intouchTransaction = await this.intouchService.buyAirtime(
        debit.id,
        amount,
        provider,
        formattedPhoneNumber,
      );

      return intouchTransaction;
    } catch (e) {
      await this.rehiveService.updateTransactionStatus(debit.id, 'Failed');
      throw e;
    }
  }

  async withdrawal(withdrawalData: WithdrawalDto) {
    const {
      userId,
      provider,
      phoneNumber,
      amount,
      status,
      currency,
    } = withdrawalData;
    const debit = await this.rehiveService.debit(userId, {
      amount,
      status,
      currency,
    });

    const formattedPhoneNumber = phoneNumber.replace('+226', '');
    try {
      const intouchTransaction = await this.intouchService.withdrawal(
        debit.id,
        amount,
        provider,
        formattedPhoneNumber,
      );

      return intouchTransaction;
    } catch (e) {
      await this.rehiveService.updateTransactionStatus(debit.id, 'Failed');
      throw e;
    }
  }

  async sendTransferNotifications(
    userId: string,
    recipientId: string,
    transferAmount: number,
  ) {
    const user = await this.usersService.findOneById(userId);
    const recipient = await this.usersService.findOneById(recipientId);

    const messageTo = {
      notification: {
        title: '',
        body: `You have just sent ${transferAmount}₣ to ${recipient.username} from your wallet`,
      },
    };
    if (user.pushNotifications.show) {
      this.firebaseService.sendNotification(
        user.pushNotifications.tokens,
        messageTo,
      );
    }

    const messageFrom = {
      notification: {
        title: '',
        body: `You have just received ${transferAmount}₣ from ${user.username} to your wallet`,
      },
    };
    if (recipient.pushNotifications.show) {
      this.firebaseService.sendNotification(
        recipient.pushNotifications.tokens,
        messageFrom,
      );
    }
  }
}
