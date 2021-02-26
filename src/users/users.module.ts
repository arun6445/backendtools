import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { AuthModule } from 'auth/auth.module';
import { TransactionsModule } from 'transactions/transactions.module';
import { CommonModule } from 'common/common.module';

import { User, PhoneNumber, DebitCard } from './model/users.document';
import {
  UsersSchema,
  PhoneNumberSchema,
  DebitCardSchema,
} from './model/users.schema';

import { UsersService } from './users.service';
import { UsersController } from './users.controller';

@Module({
  providers: [UsersService],
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UsersSchema },
      { name: PhoneNumber.name, schema: PhoneNumberSchema },
      { name: DebitCard.name, schema: DebitCardSchema },
    ]),
    forwardRef(() => AuthModule),
    CommonModule,
    TransactionsModule,
  ],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}
