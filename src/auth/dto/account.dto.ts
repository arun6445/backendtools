import { RehiveKYCStatus } from 'common/rehive/rehive.interfaces';
import { UserDocument } from 'users/model/';
import { OAuthProvider } from './o-auth-provider.dto';

export class AccountDto {
  public email: string;

  public username: string;

  public account: string;

  public phoneNumber: string;

  public oauth: OAuthProvider;

  public accessToken: string;

  public password: string;

  public _id: string;

  public verificationStatus: RehiveKYCStatus;

  public birthDate: Date | null;

  public country: string;

  public firstName: string;

  public lastName: string;

  static fromAccountDocument(
    account: UserDocument,
    accessToken: string,
  ): AccountDto {
    const accountDto = new AccountDto();
    accountDto._id = account._id;
    accountDto.account = account.account;
    accountDto.email = account.email;
    accountDto.birthDate = account.birthDate;
    accountDto.country = account.country;
    accountDto.firstName = account.firstName;
    accountDto.lastName = account.lastName;
    accountDto.username = account.username;
    accountDto.phoneNumber = account.phoneNumber;
    accountDto.oauth = account.oauth;
    accountDto.accessToken = accessToken;
    accountDto.verificationStatus = account.kyc.status;

    return accountDto;
  }
}
