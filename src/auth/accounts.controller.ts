import {
  Body,
  Controller,
  Post,
  HttpException,
  HttpStatus,
  Patch,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import TwilioService from 'services/twilio.service';

import { AuthService } from './auth.service';
import {
  CreateAccountDto,
  PhoneNumberWithCodeDto,
  PhoneNumberDto,
  ResetPasswordDto,
} from './dto/create-account.dto';
import { SignInAccountDto } from './dto/signin-account.dto';
import {
  FacebookSignUpAccountDto,
  FacebookSignInAccountDto,
} from './dto/facebook-account';
import { VerificationToken } from './dto/tokens.dto';
import { AccountDto } from './dto/account.dto';

@Controller('accounts')
export class AccountsController {
  constructor(
    private readonly authService: AuthService,
    private readonly twilioService: TwilioService,
    private readonly configService: ConfigService,
  ) {}

  @Post('signup')
  create(@Body() createAccountDto: CreateAccountDto): Promise<AccountDto> {
    return this.authService.create(createAccountDto);
  }

  @Post('send/code')
  async sendToTwilio(
    @Body() { phoneNumber }: PhoneNumberDto,
  ): Promise<Record<any, never>> {
    const isUserExists = await this.authService.checkPhoneNumberExistence(
      phoneNumber,
    );
    if (isUserExists) {
      throw new HttpException(
        { phoneNumber: 'This phone number is already registered' },
        HttpStatus.BAD_REQUEST,
      );
    }
    await this.twilioService.startVerification(phoneNumber);
    return {};
  }

  @Post('verify/code')
  async checkVerificationTwilioCode(
    @Body() { phoneNumber, code }: PhoneNumberWithCodeDto,
  ): Promise<VerificationToken> {
    return this.twilioService.checkVerification(phoneNumber, code);
  }

  @Post('signup/facebook')
  async signUpFacebook(
    @Body()
    { facebookAccessToken, verificationToken }: FacebookSignUpAccountDto,
  ): Promise<AccountDto> {
    return this.authService.signUpFacebook(
      facebookAccessToken,
      verificationToken,
    );
  }

  @Post('signin/facebook')
  async signInFacebook(
    @Body() { facebookAccessToken }: FacebookSignInAccountDto,
  ): Promise<AccountDto> {
    return this.authService.signInFacebook(facebookAccessToken);
  }

  @Post('forgot-password')
  async forgotPassword(
    @Body() { phoneNumber }: PhoneNumberDto,
  ): Promise<Record<any, never>> {
    const isUserExists = await this.authService.checkPhoneNumberExistence(
      phoneNumber,
    );
    if (!isUserExists) {
      throw new HttpException(
        { email: 'This phone number is not registered' },
        HttpStatus.BAD_REQUEST,
      );
    }
    await this.twilioService.startVerification(phoneNumber);
    return {};
  }

  @Post('signin')
  async login(@Body() signInAccountDto: SignInAccountDto): Promise<AccountDto> {
    return this.authService.signIn(signInAccountDto);
  }

  @Patch('reset-password')
  async resetPassword(
    @Body() resetPasswordDto: ResetPasswordDto,
  ): Promise<AccountDto> {
    return this.authService.resetPassword(resetPasswordDto);
  }
}
