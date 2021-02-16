import { IsNotEmpty, IsDateString } from 'class-validator';

export class VerifyUserDto {
  @IsNotEmpty({ message: 'First name should not be empty' })
  firstName: string;

  @IsNotEmpty({ message: 'Last name should not be empty' })
  lastName: string;

  @IsNotEmpty({ message: 'Birth date should not be empty' })
  @IsDateString()
  birthDate: Date;

  @IsNotEmpty({ message: 'Country should not be empty' })
  country: string;

  @IsNotEmpty()
  identityAccessKey: string;
}
