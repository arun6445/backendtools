import { HttpModule, Module } from '@nestjs/common';

import InTouchService from './intouch/intouch.service';
import RehiveService from './rehive/rehive.service';
import S3Service from './s3/s3.service';
import CoinbaseService from './coinbase/coinbase.service';
import CoinMarketCapService from './coinmarketcap/coin-market-cap.service';
import { fireblocksFactory } from './fireblocks';
import { firebaseFactory } from './firebase';

@Module({
  providers: [
    RehiveService,
    InTouchService,
    S3Service,
    fireblocksFactory,
    CoinbaseService,
    CoinMarketCapService,
    firebaseFactory,
  ],
  imports: [HttpModule],
  exports: [
    RehiveService,
    InTouchService,
    S3Service,
    fireblocksFactory,
    CoinbaseService,
    CoinMarketCapService,
    firebaseFactory,
  ],
})
export class CommonModule {}
