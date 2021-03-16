import { Prop, Schema } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Crypto extends Document {
  @Prop({
    unique: true,
    required: true,
    trim: true,
  })
  cryptoName: string;

  @Prop({
    required: true,
  })
  requestDate: Date;

  @Prop({
    required: true,
  })
  dynamic: number;
}
