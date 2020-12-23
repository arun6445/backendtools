import { IsEmail, IsNotEmpty, Length, Validate } from 'class-validator';

import { PasswordValidation } from '../validation/password-validation';

export class PhoneNumberDto {
  @IsNotEmpty({ message: 'Phone should not be empty' })
  readonly phoneNumber: string;
}

export class PhoneNumberWithCodeDto extends PhoneNumberDto {
  @Length(4, 6, {
    message: 'Code should not be minimum 4 symbols and maximum 6',
  })
  readonly twilioCode: string;
}

export class CreateAccountDto extends PhoneNumberDto {
  @IsEmail({}, { message: 'Invalid email' })
  readonly email: string;

  @IsNotEmpty({ message: 'Name should not be empty' })
  readonly username: string;

  @Validate(PasswordValidation)
  readonly password: string;
}
