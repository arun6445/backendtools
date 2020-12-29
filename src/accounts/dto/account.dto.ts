import { Account } from '../schemas/account.schema';
import { OAuthProvider } from './o-auth-provider.dto';

export class AccountDto {
  public email: string;

  public username: string;

  public phoneNumber: string;

  public oauth: OAuthProvider;

  public accessToken: string;

  public password: string;

  public _id: string;

  static fromAccountDocument(
    account: Account,
    accessToken: string,
  ): AccountDto {
    const accountDto = new AccountDto();
    accountDto.email = account.email;
    accountDto.username = account.username;
    accountDto.phoneNumber = account.phoneNumber;
    accountDto.oauth = account.oauth;
    accountDto.accessToken = accessToken;

    return accountDto;
  }
}
