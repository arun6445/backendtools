import { IsNotEmpty } from 'class-validator';

export class KYCInfoDto {
  @IsNotEmpty()
  readonly event: 'VERIFICATION_REVIEWED' | 'VERIFICATION_COMPLETED';

  @IsNotEmpty()
  readonly key: string;

  @IsNotEmpty()
  readonly status: 'pending' | 'approved' | 'declined';
}
