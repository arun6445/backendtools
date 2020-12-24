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

import { AccountsService } from './accounts.service';
import { AccountDto } from './dto/account.dto';
import {
  CreateAccountDto,
  PhoneNumberWithCodeDto,
  PhoneNumberDto,
  ResetPasswordDto,
  EmailDto,
} from './dto/create-account.dto';

@Controller('accounts')
export class AccountsController {
  constructor(
    private readonly accountsService: AccountsService,
    private readonly twilioService: TwilioService,
    private readonly configService: ConfigService,
  ) {}

  @Post('signup')
  create(@Body() createAccountDto: CreateAccountDto): Promise<AccountDto> {
    return this.accountsService.create(createAccountDto);
  }

  @Post('check-email')
  async checkEmail(@Body() { email }: EmailDto) {
    await this.accountsService.checkEmailExistence(email);
    return {};
  }

  @Post('send/code')
  async sendToTwilio(@Body() { phoneNumber }: PhoneNumberDto) {
    if (phoneNumber === this.configService.get<string>('TEST_NUMBER')) {
      return { code: this.configService.get<string>('TEST_VERIFICATION_CODE') };
    }
    const isUserExists = await this.accountsService.checkPhoneNumberExistence(
      phoneNumber,
    );
    if (isUserExists) {
      throw new HttpException(
        { phoneNumber: 'This phone number is already registered' },
        HttpStatus.BAD_REQUEST,
      );
    }
    return this.twilioService.startVerification(phoneNumber);
  }

  @Post('verify/code')
  async checkVerificationTwilioCode(
    @Body() { phoneNumber, code }: PhoneNumberWithCodeDto,
  ) {
    return this.twilioService.checkVerification(phoneNumber, code);
  }

  @Post('forgot-password')
  async forgotPassword(@Body() { phoneNumber }: PhoneNumberDto) {
    if (phoneNumber === this.configService.get<string>('TEST_NUMBER')) {
      return { code: this.configService.get<string>('TEST_VERIFICATION_CODE') };
    }
    const isUserExists = await this.accountsService.checkPhoneNumberExistence(
      phoneNumber,
    );
    if (!isUserExists) {
      throw new HttpException(
        { email: 'This phone number is not registered' },
        HttpStatus.BAD_REQUEST,
      );
    }
    return this.twilioService.startVerification(phoneNumber);
  }

  @Patch('reset-password')
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.accountsService.resetPassword(resetPasswordDto);
  }
}
