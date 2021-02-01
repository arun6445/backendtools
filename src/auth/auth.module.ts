import { Module } from '@nestjs/common';

import { JsonWebTokenService } from 'auth/services/jwt.service';
import { RehiveModule } from 'rehive/rehive.module';
import TwilioService from 'services/twilio.service';
import { UsersModule } from 'users/users.module';

import { AccountsController } from './accounts.controller';
import { AuthService } from './auth.service';
import { AuthGuard } from './guards/auth.guard';

@Module({
  imports: [UsersModule, RehiveModule],
  providers: [TwilioService, AuthService, JsonWebTokenService, AuthGuard],
  controllers: [AccountsController],
  exports: [AuthGuard, JsonWebTokenService],
})
export class AuthModule {}
