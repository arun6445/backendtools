import { SchemaFactory } from '@nestjs/mongoose'

import { Crypto } from './crypto.document'

export const CryptoSchema = SchemaFactory.createForClass(Crypto)
