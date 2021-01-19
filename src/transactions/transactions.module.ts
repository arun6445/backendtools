import { Module } from '@nestjs/common';

import { RehiveModule } from 'rehive/rehive.module';
import { AuthModule } from 'auth/auth.module';
import { UsersModule } from 'users/users.module';

import { TransactionsService } from './transactions.service';
import { TransactionsController } from './transactions.controller';

@Module({
  providers: [TransactionsService],
  imports: [RehiveModule, AuthModule, UsersModule],
  controllers: [TransactionsController],
})
export class TransactionsModule {}
