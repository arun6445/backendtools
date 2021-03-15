import { IsNotEmpty, IsOptional } from 'class-validator';
import { IntouchProvider } from 'common/intouch/intouch.constants';
import { RehiveTransactionStatus } from '../rehive.interfaces';

export class CreateTransactionDto {
  @IsNotEmpty({ message: 'Amount is required.' })
  readonly amount: number;

  readonly currency?: string = 'XOF';

  readonly status?: RehiveTransactionStatus = 'Complete'; // TODO: Remove when payment processor will be implemented
}

export class WithdrawalDto extends CreateTransactionDto {
  @IsNotEmpty({ message: 'User is required' })
  userId: string;

  @IsNotEmpty({ message: 'Phone number is required.' })
  phoneNumber: string;

  @IsNotEmpty({ message: 'Provider is required' })
  provider: IntouchProvider;

  readonly status?: RehiveTransactionStatus = 'Pending';
}

export class MobileDepositDto extends CreateTransactionDto {
  @IsNotEmpty({ message: 'User is required' })
  userId: string;

  @IsOptional()
  @IsNotEmpty({ message: 'OTP is required' })
  otp?: string;

  @IsNotEmpty({ message: 'Phone number is required.' })
  phoneNumber: string;

  @IsNotEmpty({ message: 'Provider is required' })
  provider: IntouchProvider;

  readonly status?: RehiveTransactionStatus = 'Pending';
}
