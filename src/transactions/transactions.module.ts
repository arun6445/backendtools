import { forwardRef, Module } from '@nestjs/common';

import { RehiveModule } from 'rehive/rehive.module';
import { AuthModule } from 'auth/auth.module';

import { TransactionsService } from './transactions.service';
import { TransactionsController } from './transactions.controller';
import { UsersModule } from 'users/users.module';

@Module({
  providers: [TransactionsService],
  imports: [
    RehiveModule,
    forwardRef(() => AuthModule),
    forwardRef(() => UsersModule),
  ],
  controllers: [TransactionsController],
  exports: [TransactionsService],
})
export class TransactionsModule {}
