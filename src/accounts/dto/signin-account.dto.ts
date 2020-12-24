import { IsEmail, IsNotEmpty } from 'class-validator';

export class SignInAccountDto {
  @IsEmail({}, { message: 'Invalid email' })
  readonly email: string;

  @IsNotEmpty({ message: 'Password should not be empty' })
  readonly password: string;
}
