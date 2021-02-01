import {
  Controller,
  Get,
  Req,
  UseGuards,
  Post,
  Delete,
  Body,
  Param,
} from '@nestjs/common';

import { AuthGuard } from 'auth/guards/auth.guard';
import { SavedPhoneNumberDto, AddPhoneNumberDto } from './users.interfaces';
import { UsersService } from './users.service';

@Controller('users')
@UseGuards(AuthGuard)
export class UsersController {
  constructor(private usersService: UsersService) {}
  @Get('current/balance')
  public getCurrentUserBalance(@Req() req) {
    const { user } = req;

    return this.usersService.getBalance(user.account);
  }

  @Get('/current/transactions')
  public getCurrentUserTransactionsList(@Req() req) {
    const { user } = req;

    return this.usersService.getTransactions(user._id);
  }

  @Get('/current/phonenumbers')
  public getCurrentUserPhoneNumbers(
    @Req() req,
  ): Promise<SavedPhoneNumberDto[]> {
    const { user } = req;

    return this.usersService.getPhoneNumbers(user._id);
  }

  @Post('/current/phonenumbers')
  public addCurrentUserPhoneNumbers(
    @Req() req,
    @Body() { phoneNumber, phoneOperator }: AddPhoneNumberDto,
  ): Promise<SavedPhoneNumberDto> {
    const { user } = req;

    return this.usersService.addPhoneNumber(
      user._id,
      phoneNumber,
      phoneOperator,
    );
  }

  @Delete('/current/phoneNumbers/:phoneNumberId')
  public removeCurrentUserPhoneNumber(
    @Req() req,
    @Param('phoneNumberId') phoneNumberId: string,
  ) {
    const { user } = req;
    this.usersService.removePhoneNumber(user._id, phoneNumberId);

    return {};
  }
}
