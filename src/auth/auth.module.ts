import { Module } from '@nestjs/common';
import { RehiveModule } from 'rehive/rehive.module';

import { JsonWebTokenService } from 'auth/services/jwt.service';
import TwilioService from 'services/twilio.service';
import { UsersModule } from 'users/users.module';

import { AccountsController } from './accounts.controller';
import { AuthService } from './auth.service';
import { AuthGuard } from './guards/auth.guard';

@Module({
  providers: [TwilioService, AuthService, JsonWebTokenService, AuthGuard],
  imports: [RehiveModule, UsersModule],
  controllers: [AccountsController],
  exports: [AuthGuard, JsonWebTokenService],
})
export class AuthModule {}
