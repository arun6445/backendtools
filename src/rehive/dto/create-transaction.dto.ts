import { IsNotEmpty } from 'class-validator';
import { RehiveTransactionStatus } from 'rehive/rehive.interfaces';

export class CreateTransactionDto {
  @IsNotEmpty({ message: 'Amount is required.' })
  readonly amount: number;

  readonly currency?: string = 'XOF';

  readonly status?: RehiveTransactionStatus = 'Complete'; // TODO: Remove when payment processor will be implemented
}
