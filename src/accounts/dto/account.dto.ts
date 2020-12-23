import { Account } from '../schemas/account.schema';
import { OAuthProvider } from './o-auth-provider.dto';

export class AccountDto {
  public email: string;

  public username: string;

  public phoneNumber: string;

  public auth: OAuthProvider;

  static fromAccountDocument(account: Account): AccountDto {
    const accountDto = new AccountDto();
    accountDto.email = account.email;
    accountDto.username = account.username;
    accountDto.phoneNumber = account.phoneNumber;
    accountDto.auth = account.auth;

    return accountDto;
  }
}
