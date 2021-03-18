import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Post,
  Req,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { AuthGuard } from 'auth/guards/auth.guard';
import {
  WithdrawalDto,
  CreateTransactionDto,
  CreateTransferDto,
  MobileDepositDto,
} from 'common/rehive/dto';
import { AuthRequest } from 'auth/dto/auth-request.dto';
import { TransactionsService } from './transactions.service';
import { Public } from 'common/decorators/public.decorator';
import { IntouchWebhookResponse } from 'common/intouch/dto';

@Controller('transactions')
@UseGuards(AuthGuard)
export class TransactionsController {
  constructor(private transactionService: TransactionsService) {}

  @Post('credit')
  @UsePipes(new ValidationPipe({ transform: true }))
  public async credit(
    @Body() transactionData: CreateTransactionDto,
    @Req() req: AuthRequest,
  ) {
    const { user } = req;
    try {
      const transaction = await this.transactionService.credit(
        user._id,
        transactionData,
      );
      return transaction;
    } catch (e) {
      throw new HttpException(e.response.data.data, HttpStatus.BAD_REQUEST);
    }
  }

  @Post('debit')
  @UsePipes(new ValidationPipe({ transform: true }))
  public async debit(
    @Body() transactionData: CreateTransactionDto,
    @Req() req: AuthRequest,
  ) {
    const { user } = req;

    try {
      const transaction = await this.transactionService.debit(
        user._id,
        transactionData,
      );
      return transaction;
    } catch (e) {
      throw new HttpException(e.response.data.data, HttpStatus.BAD_REQUEST);
    }
  }

  @Post('transfer')
  @UsePipes(new ValidationPipe({ transform: true }))
  public async transfer(
    @Body() transferData: CreateTransferDto,
    @Req() req: AuthRequest,
  ) {
    const { user } = req;

    try {
      const transaction = await this.transactionService.transfer(
        user._id,
        transferData,
      );

      this.transactionService.sendTransferNotifications(
        user._id,
        transferData.recipient,
        transferData.amount,
      );

      return transaction;
    } catch (e) {
      throw new HttpException(e.response.data.data, HttpStatus.BAD_REQUEST);
    }
  }

  @Post('/mobile-deposit')
  @UsePipes(new ValidationPipe({ transform: true }))
  public async mobileMoneyDeposit(
    @Body() mobileMoneyDepositData: MobileDepositDto,
  ) {
    try {
      const transaction = await this.transactionService.mobileMoneyDeposit(
        mobileMoneyDepositData,
      );

      return transaction;
    } catch (e) {
      const error = e.response.body;
      throw new HttpException(
        error.detailMessage || error.message,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Post('/airtime')
  @UsePipes(new ValidationPipe({ transform: true }))
  public async buyAirtime(@Body() airtimeDto: WithdrawalDto) {
    try {
      const transaction = await this.transactionService.buyAirtime(airtimeDto);

      return transaction;
    } catch (e) {
      const error = e.response.body;
      throw new HttpException(
        error.detailMessage || error.message,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Post('/mobile-deposit/webhook')
  @Public()
  public mobileMoneyDepositWebhook(@Body() body: IntouchWebhookResponse) {
    return this.transactionService.processIntouchTransaction(body);
  }

  @Post('/withdrawal')
  @UsePipes(new ValidationPipe({ transform: true }))
  public async withdrawal(@Body() withdrawalDto: WithdrawalDto) {
    try {
      const transaction = await this.transactionService.withdrawal(
        withdrawalDto,
      );

      return transaction;
    } catch (e) {
      const error = e.response.body || e.response.data;
      throw new HttpException(
        error.detailMessage || error.message,
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
