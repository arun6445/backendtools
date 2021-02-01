import { Prop, Schema } from '@nestjs/mongoose';

import BaseDocument from 'base/base.document';
import { OAuthProvider } from '../users.interfaces';
import { Document } from 'mongoose';

@Schema()
export class PhoneNumber extends Document {
  @Prop()
  phoneNumber: string;

  @Prop()
  phoneOperator: string;
}

@Schema({ timestamps: true })
export class User extends BaseDocument {
  @Prop({
    unique: true,
    required: true,
    trim: true,
  })
  email: string;

  @Prop({
    unique: true,
    required: true,
    trim: true,
  })
  username: string;

  @Prop()
  account: string;

  @Prop({
    trim: true,
  })
  phoneNumber: string;

  @Prop()
  password: string;

  @Prop()
  oauth: OAuthProvider;

  @Prop()
  savedPhoneNumbers: Array<PhoneNumber>;
}