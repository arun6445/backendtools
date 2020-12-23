import { Body, Controller, Post } from '@nestjs/common';

import { AccountsService } from './accounts.service';
import { AccountDto } from './dto/account.dto';
import {
  CreateAccountDto,
  PhoneNumberWithCodeDto,
  PhoneNumberDto,
} from './dto/create-account.dto';
import { TwilioService } from 'services/twilio.service';

@Controller('accounts')
export class AccountsController {
  constructor(
    private readonly AccountsService: AccountsService,
    private twilioService: TwilioService,
  ) {}

  @Post('signup')
  create(@Body() createAccountDto: CreateAccountDto): Promise<AccountDto> {
    return this.AccountsService.create(createAccountDto);
  }

  @Post('send/code')
  async sendToTwilio(@Body() { phoneNumber }: PhoneNumberDto) {
    await this.twilioService.startVerification(phoneNumber);
  }

  @Post('verify/code')
  async checkVerfifcationTwilioCode(
    @Body() { phoneNumber, twilioCode }: PhoneNumberWithCodeDto,
  ) {
    await this.twilioService.checkVerification(phoneNumber, twilioCode);
  }
}
