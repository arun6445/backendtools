import { HttpModule, Module } from '@nestjs/common';
import InTouchService from './intouch/intouch.service';
import RehiveService from './rehive/rehive.service';

@Module({
  providers: [RehiveService, InTouchService],
  imports: [HttpModule],
  exports: [RehiveService, InTouchService],
})
export class CommonModule {}
