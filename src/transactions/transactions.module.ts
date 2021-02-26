import { forwardRef, Module } from '@nestjs/common';

import { AuthModule } from 'auth/auth.module';
import { UsersModule } from 'users/users.module';
import { CommonModule } from 'common/common.module';

import { TransactionsService } from './transactions.service';
import { TransactionsController } from './transactions.controller';

@Module({
  providers: [TransactionsService],
  imports: [
    CommonModule,
    forwardRef(() => AuthModule),
    forwardRef(() => UsersModule),
  ],
  controllers: [TransactionsController],
  exports: [TransactionsService],
})
export class TransactionsModule {}
