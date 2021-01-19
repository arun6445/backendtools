import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from 'auth/guards/auth.guard';
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
}
