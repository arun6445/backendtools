import { SchemaFactory } from '@nestjs/mongoose';

import { User, PhoneNumber } from './users.document';

export const UsersSchema = SchemaFactory.createForClass(User);
export const PhoneNumberSchema = SchemaFactory.createForClass(PhoneNumber);

UsersSchema.methods.toJSON = function () {
  return {
    ...this.toObject(),
    password: undefined,
  };
};
