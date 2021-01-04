import { HttpModule, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import JsonWebTokenService from 'services/json-web-token.service';
import RehiveService from 'services/rehive.service';
import TwilioService from 'services/twilio.service';

import { AccountsController } from './accounts.controller';
import { AccountsService } from './accounts.service';
import { Account, AccountSchema } from './schemas/account.schema';

@Module({
  providers: [
    TwilioService,
    AccountsService,
    JsonWebTokenService,
    RehiveService,
  ],
  controllers: [AccountsController],
  imports: [
    HttpModule,
    MongooseModule.forFeature([{ name: Account.name, schema: AccountSchema }]),
  ],
})
export class AccountsModule {}
