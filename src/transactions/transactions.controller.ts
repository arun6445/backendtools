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
import RehiveService from 'rehive/rehive.service';
import { CreateTransactionDto, CreateTransferDto } from 'rehive/dto';
import { AuthRequest } from 'auth/dto/auth-request.dto';

@Controller('transactions')
@UseGuards(AuthGuard)
export class TransactionsController {
  constructor(private rehiveService: RehiveService) {}
  @Post('credit')
  @UsePipes(new ValidationPipe({ transform: true }))
  public async credit(
    @Body() transactionData: CreateTransactionDto,
    @Req() req: AuthRequest,
  ) {
    const { user } = req;
    try {
      const transaction = await this.rehiveService.credit(
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
      const transaction = await this.rehiveService.debit(
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
      const transaction = await this.rehiveService.transfer(
        user._id,
        transferData,
      );
      return transaction;
    } catch (e) {
      throw new HttpException(e.response.data.data, HttpStatus.BAD_REQUEST);
    }
  }
}
