import { RehiveKYCStatus } from 'common/rehive/rehive.interfaces';

import { PhoneNumber } from 'users/model/users.document';
import { UserDocument } from './model';

export class OAuthProvider {
  google: string;
  facebook: string;
}

export class KYCInfo {
  status: RehiveKYCStatus;
  identityAccessKey: string | null;
}

export interface SavedPhoneNumberDto {
  _id?: string;
  phoneOperator: string;
  phoneNumber: string;
}

export interface AddPhoneNumberDto {
  phoneOperator: string;
  phoneNumber: string;
}

export interface SavedDebitCardDto {
  _id?: string;
  cardHolder: string;
  cardNumber: string;
  cardCVC: string;
  cardExpirationDate: string;
  cardBrand: string;
}

export interface AddDebitCardDto {
  cardHolder: string;
  cardNumber: string;
  cardCVC: string;
  cardExpirationDate: string;
  cardBrand: string;
}

export interface ResetPasswordDto {
  currentPassword: string;
  newPassword: string;
}

export class UserDto {
  _id: string;
  email: string;
  phoneNumber: string;
  isHiddenBalance: boolean;
  firstName: string;
  lastName: string;
  username: string;
  birthDate: Date;
  country: string;
  oauth: OAuthProvider;
  savedPhoneNumbers: Array<PhoneNumber>;
  verificationStatus: RehiveKYCStatus;

  static fromUserDocument(userDocument: UserDocument): UserDto {
    const user = new UserDto();

    user._id = userDocument._id;
    user.email = userDocument.email;
    user.phoneNumber = userDocument.phoneNumber;
    user.isHiddenBalance = userDocument.isHiddenBalance;
    user.firstName = userDocument.firstName;
    user.lastName = userDocument.lastName;
    user.username = userDocument.username;
    user.birthDate = userDocument.birthDate;
    user.country = userDocument.country;
    user.oauth = userDocument.oauth;
    user.savedPhoneNumbers = userDocument.savedPhoneNumbers;
    user.verificationStatus = userDocument.kyc.status;
    return user;
  }
}

export interface FindContactsDto {
  givenName: string;
  phoneNumber: string;
  username?: string;
  userId?: string;
}
