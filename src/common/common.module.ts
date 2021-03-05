import { HttpModule, Module } from '@nestjs/common';

import InTouchService from './intouch/intouch.service';
import RehiveService from './rehive/rehive.service';
import S3Service from './s3/s3.service';
import { fireblocksFactory } from './fireblocks';

@Module({
  providers: [RehiveService, InTouchService, S3Service, fireblocksFactory],
  imports: [HttpModule],
  exports: [RehiveService, InTouchService, S3Service, fireblocksFactory],
})
export class CommonModule {}
