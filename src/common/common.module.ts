import { HttpModule, Module } from '@nestjs/common';

import InTouchService from './intouch/intouch.service';
import RehiveService from './rehive/rehive.service';
import S3Service from './s3/s3.service';
import CoinbaseService from './coinbase/coinbase.service';
import { fireblocksFactory } from './fireblocks';
import CoinMarketCapService from './coinmarketcap/coin-market-cap.service';

@Module({
  providers: [
    RehiveService,
    InTouchService,
    S3Service,
    fireblocksFactory,
    CoinbaseService,
    CoinMarketCapService,
  ],
  imports: [HttpModule],
  exports: [
    RehiveService,
    InTouchService,
    S3Service,
    fireblocksFactory,
    CoinbaseService,
    CoinMarketCapService,
  ],
})
export class CommonModule {}
