import { Module } from '@nestjs/common';
import { IntouchController } from './intouch.controller';
import { IntouchService } from './intouch.service';

@Module({
  controllers: [IntouchController],
  providers: [IntouchService]
})
export class IntouchModule {}
