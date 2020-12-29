import { IsNotEmpty } from 'class-validator';

export class FacebookAccount {
  public id: string;

  public email: string;
}

export class FacebookSignUpAccountDto {
  @IsNotEmpty({ message: 'Facebook token should not be empty' })
  readonly facebookAccessToken: string;

  @IsNotEmpty({ message: 'Verification token should not be empty' })
  readonly verificationToken: string;
}

export class FacebookSignInAccountDto {
  @IsNotEmpty({ message: 'Facebook token should not be empty' })
  readonly facebookAccessToken: string;
}
