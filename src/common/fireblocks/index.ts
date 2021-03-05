import { ConfigService } from '@nestjs/config';

import S3Service from 'common/s3/s3.service';
import FireblocksService from './fireblocks.service';

export const fireblocksFactory = {
  provide: FireblocksService,
  useFactory: async (configService: ConfigService, s3Service: S3Service) => {
    const apiSecret = await s3Service.getDataFromS3('fireblocks_secret.key');
    return new FireblocksService(configService, apiSecret);
  },
  inject: [ConfigService, S3Service],
};
