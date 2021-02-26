import { IsNotEmpty } from 'class-validator';

export type IntouchTransactionStatus = 'FAILED' | 'SUCCESSFUL';

export class IntouchWebhookResponse {
  @IsNotEmpty()
  readonly status: IntouchTransactionStatus;

  @IsNotEmpty()
  private readonly partner_transaction_id: string;

  @IsNotEmpty()
  private readonly service_id: string;

  get serviceId() {
    return this.service_id;
  }

  get partnerTransactionId() {
    return this.partner_transaction_id;
  }
}
