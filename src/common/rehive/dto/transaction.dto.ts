import {
  RehiveTransactionStatus,
  RehiveCurrency,
  RehiveTransaction,
} from '../rehive.interfaces';

export class Transaction {
  public id: string;
  public userId: string;
  public type: 'credit' | 'debit';
  public status: RehiveTransactionStatus;
  public amount: number;
  public balance: number;
  public currency: RehiveCurrency;
  public created: Date;
  public partnerId: string;

  static fromRehiveTransaction(rehiveTransaction: RehiveTransaction) {
    const transaction = new Transaction();

    transaction.id = rehiveTransaction.id;
    transaction.userId = rehiveTransaction.user.id;
    transaction.type = rehiveTransaction.tx_type;
    transaction.status = rehiveTransaction.status;
    transaction.amount = rehiveTransaction.amount;
    transaction.balance = rehiveTransaction.balance;
    transaction.currency = rehiveTransaction.currency;
    transaction.partnerId = rehiveTransaction.partner
      ? rehiveTransaction.partner.user.id
      : null;
    transaction.created = new Date(rehiveTransaction.created);

    return transaction;
  }
}

export type TransactionsWithCount = {
  transactions: Transaction[];
  count: number;
};
