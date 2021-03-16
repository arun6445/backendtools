import { MongooseModule } from '@nestjs/mongoose';
import { Module } from '@nestjs/common';

import { Crypto } from 'crypto/model/crypto.document';
import { CryptoSchema } from 'crypto/model';
import CryptoService from './crypto.service';
import { CommonModule } from 'common/common.module';

@Module({
  providers: [CryptoService],
  imports: [
    MongooseModule.forFeature([{ name: Crypto.name, schema: CryptoSchema }]),
    CommonModule,
  ],
  exports: [CryptoService],
})
export default class CryptoModule {}
