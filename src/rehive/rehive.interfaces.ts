export type RehiveResponseSuccess<T> = {
  status: 'success';
  data: T;
};

export type RehiveResponseError = {
  status: 'error';
  message: string;
  data: any;
};

export type RehiveCurrency = {
  code: string;
  description: string;
  symbol: string;
  unit: string;
  divisibility: number;
};

export type RehiveUser = {
  id: string;
  account: string;
};

export type RehiveTransactionStatus =
  | 'Initiating'
  | 'Pending'
  | 'Complete'
  | 'Failed';

export type RehiveResponse<T> = RehiveResponseSuccess<T> | RehiveResponseError;

export type RehiveTransaction = {
  id: string;
  user: { id: string };
  tx_type: 'credit' | 'debit';
  status: RehiveTransactionStatus;
  amount: number;
  balance: number;
  currency: RehiveCurrency;
  partner?: {
    user: {
      id: string;
    };
  };
};

export type RehiveBalance = {
  balance: number;
  available_balance: number;
  currency: RehiveCurrency;
};