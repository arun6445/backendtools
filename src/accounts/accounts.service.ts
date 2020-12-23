import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { getHash } from 'helpers/security.util';
import { AccountDto } from 'accounts/dto/account.dto';

import { CreateAccountDto } from './dto/create-account.dto';
import { Account, AccountDocument } from './schemas/account.schema';

@Injectable()
export class AccountsService {
  constructor(
    @InjectModel(Account.name) private accountModel: Model<AccountDocument>,
  ) {}

  async create(createAccountDto: CreateAccountDto): Promise<AccountDto> {
    const isEmailExists = await this.accountModel.exists({
      email: createAccountDto.email,
    });
    if (isEmailExists) {
      throw new HttpException(
        { email: 'This email is already registrated' },
        HttpStatus.BAD_REQUEST,
      );
    }

    const isPhoneNumberExists = await this.accountModel.exists({
      phoneNumber: createAccountDto.phoneNumber,
    });

    if (isPhoneNumberExists) {
      throw new HttpException(
        { phoneNumber: 'This phone is already registrated' },
        HttpStatus.BAD_REQUEST,
      );
    }

    const password = await getHash(createAccountDto.password);
    const newUser = new this.accountModel({
      ...createAccountDto,
      password,
      auth: {
        facebook: '',
        google: '',
      },
    });

    await newUser.save();

    return AccountDto.fromAccountDocument(newUser);
  }
}
