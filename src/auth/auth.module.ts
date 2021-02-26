import { Module } from '@nestjs/common';

import { JsonWebTokenService } from 'auth/services/jwt.service';
import { CommonModule } from 'common/common.module';

import TwilioService from 'services/twilio.service';
import { UsersModule } from 'users/users.module';

import { AccountsController } from './accounts.controller';
import { AuthService } from './auth.service';
import { AuthGuard } from './guards/auth.guard';

@Module({
  imports: [UsersModule, CommonModule],
  providers: [TwilioService, AuthService, JsonWebTokenService, AuthGuard],
  controllers: [AccountsController],
  exports: [AuthGuard, JsonWebTokenService],
})
export class AuthModule {}
