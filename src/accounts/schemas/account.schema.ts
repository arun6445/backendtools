import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

import { OAuthProvider } from 'accounts/dto/o-auth-provider.dto';

export type AccountDocument = Account & Document;

@Schema()
export class Account {
  @Prop()
  email: string;

  @Prop()
  username: string;

  @Prop()
  phoneNumber: string;

  @Prop()
  password: string;

  @Prop()
  oauth: OAuthProvider;
}

export const AccountSchema = SchemaFactory.createForClass(Account);
