import { SchemaFactory } from '@nestjs/mongoose';
import { User } from './users.document';

export const UsersSchema = SchemaFactory.createForClass(User);
