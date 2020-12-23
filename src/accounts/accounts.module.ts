import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

import { TwilioService } from 'services/twilio.service';

import { AccountsController } from './accounts.controller';
import { AccountsService } from './accounts.service';
import { Account, AccountSchema } from './schemas/account.schema';

@Module({
  providers: [TwilioService, AccountsService],
  controllers: [AccountsController],
  imports: [
    MongooseModule.forFeature([{ name: Account.name, schema: AccountSchema }]),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
})
export class AccountsModule {}
