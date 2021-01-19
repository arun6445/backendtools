import {
  RehiveTransactionStatus,
  RehiveCurrency,
  RehiveTransaction,
} from 'rehive/rehive.interfaces';

export class Transaction {
  public id: string;
  public userId: string;
  public type: 'credit' | 'debit';
  public status: RehiveTransactionStatus;
  public amount: number;
  public balance: number;
  public currency: RehiveCurrency;
  public recipientId: string;

  static fromRehiveTransaction(rehiveTransaction: RehiveTransaction) {
    const transaction = new Transaction();

    transaction.id = rehiveTransaction.id;
    transaction.userId = rehiveTransaction.user.id;
    transaction.type = rehiveTransaction.tx_type;
    transaction.status = rehiveTransaction.status;
    transaction.amount = rehiveTransaction.amount;
    transaction.balance = rehiveTransaction.balance;
    transaction.currency = rehiveTransaction.currency;
    transaction.recipientId = rehiveTransaction.partner
      ? rehiveTransaction.partner.user.id
      : null;

    return transaction;
  }
}
