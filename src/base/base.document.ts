import { Prop, Schema } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
class BaseDocument extends Document {
  @Prop()
  readonly _id: string;
}

export default BaseDocument;
