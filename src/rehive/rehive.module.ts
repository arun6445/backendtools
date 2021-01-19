import { HttpModule, Module } from '@nestjs/common';

import RehiveService from './rehive.service';

@Module({
  providers: [RehiveService],
  imports: [HttpModule],
  exports: [RehiveService],
})
export class RehiveModule {}
