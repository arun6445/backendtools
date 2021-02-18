import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { AuthModule } from 'auth/auth.module';
import { RehiveModule } from 'rehive/rehive.module';
import { TransactionsModule } from 'transactions/transactions.module';

import { User, PhoneNumber, DebitCard } from './model/users.document';
import {
  UsersSchema,
  PhoneNumberSchema,
  DebitCardSchema,
} from './model/users.schema';

import TwilioService from 'services/twilio.service';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';

@Module({
  providers: [UsersService, TwilioService],
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UsersSchema },
      { name: PhoneNumber.name, schema: PhoneNumberSchema },
      { name: DebitCard.name, schema: DebitCardSchema },
    ]),
    forwardRef(() => AuthModule),
    RehiveModule,
    TransactionsModule,
  ],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}
