import { IsNotEmpty } from 'class-validator';
import { CreateTransactionDto } from './create-transaction.dto';

export class CreateTransferDto extends CreateTransactionDto {
  @IsNotEmpty({ message: 'Recipient is required.' })
  readonly recipient: string;
}
