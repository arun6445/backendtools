import { IsEmail, IsNotEmpty, Length, Validate } from 'class-validator';

import { PasswordValidation } from '../validation/password-validation';

export class PhoneNumberDto {
  @IsNotEmpty({ message: 'Phone should not be empty' })
  readonly phoneNumber: string;
}

export class EmailDto {
  @IsEmail({}, { message: 'Invalid email' })
  readonly email: string;
}
export class PhoneNumberWithCodeDto {
  @Length(4, 6, {
    message: 'Code should not be minimum 4 symbols and maximum 6',
  })
  readonly code: string;

  @IsNotEmpty({ message: 'Phone should not be empty' })
  readonly phoneNumber: string;
}

export class ResetPasswordDto {
  @Validate(PasswordValidation)
  readonly password: string;

  @IsNotEmpty({ message: 'Phone should not be empty' })
  readonly verificationToken: string;
}

export class CreateAccountDto {
  @IsNotEmpty({ message: 'Phone should not be empty' })
  readonly verificationToken: string;

  @IsEmail({}, { message: 'Invalid email' })
  readonly email: string;

  @IsNotEmpty({ message: 'Name should not be empty' })
  readonly username: string;

  @Validate(PasswordValidation)
  readonly password: string;
}
