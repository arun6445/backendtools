import { RehiveBalance, RehiveCurrency } from 'rehive/rehive.interfaces';

export class Balance {
  public balance: number;
  public availableBalance: number;
  public currency: RehiveCurrency;

  static fromRehiveBalanceDto(rehiveBalance: RehiveBalance) {
    const balance = new Balance();

    balance.balance = rehiveBalance.balance;
    balance.availableBalance = rehiveBalance.available_balance;
    balance.currency = rehiveBalance.currency;

    return balance;
  }
}
