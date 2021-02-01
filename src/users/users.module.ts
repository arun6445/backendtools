import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { AuthModule } from 'auth/auth.module';
import { RehiveModule } from 'rehive/rehive.module';

import { User, PhoneNumber } from './model/users.document';
import { UsersSchema, PhoneNumberSchema } from './model/users.schema';

import { UsersService } from './users.service';
import { UsersController } from './users.controller';

@Module({
  providers: [UsersService],
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UsersSchema }]),
    MongooseModule.forFeature([
      { name: PhoneNumber.name, schema: PhoneNumberSchema },
    ]),
    forwardRef(() => AuthModule),
    RehiveModule,
  ],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}
