import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { getHash } from 'helpers/security.util';
import JsonWebTokenService from 'services/json-web-token.service';

import {
  CreateAccountDto,
  PhoneNumberDto,
  ResetPasswordDto,
} from './dto/create-account.dto';
import { AccountDto } from './dto/account.dto';
import { Account, AccountDocument } from './schemas/account.schema';

@Injectable()
export class AccountsService {
  constructor(
    @InjectModel(Account.name) private accountModel: Model<AccountDocument>,
    private jsonWebTokenService: JsonWebTokenService,
  ) {}

  async create(createAccountDto: CreateAccountDto): Promise<AccountDto> {
    await this.checkEmailExistence(createAccountDto.email);

    const phoneNumber = await this.getPhoneFromToken(
      createAccountDto.verificationToken,
    );

    const isPhoneNumberExists = await this.checkPhoneNumberExistence(
      phoneNumber,
    );

    if (isPhoneNumberExists) {
      throw new HttpException(
        { phoneNumber: 'This phone is already registered' },
        HttpStatus.BAD_REQUEST,
      );
    }
    const password = await getHash(createAccountDto.password);
    const newUser = new this.accountModel({
      email: createAccountDto.email,
      username: createAccountDto.username,
      phoneNumber,
      password,
      auth: {
        facebook: '',
        google: '',
      },
    });

    await newUser.save();
    const accessToken = await this.jsonWebTokenService.sign(newUser._id);
    return AccountDto.fromAccountDocument(newUser, accessToken);
  }

  public async checkEmailExistence(email: string) {
    const isEmailExists = await this.accountModel.exists({
      email,
    });
    if (isEmailExists) {
      throw new HttpException(
        { email: 'This email is already registered' },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  public async resetPassword({
    password,
    verificationToken,
  }: ResetPasswordDto) {
    const phoneNumber = await this.getPhoneFromToken(verificationToken);
    const isPhoneNumberExists = await this.checkPhoneNumberExistence(
      phoneNumber,
    );

    if (!isPhoneNumberExists) {
      throw new HttpException(
        { phoneNumber: 'This phone is not registered' },
        HttpStatus.BAD_REQUEST,
      );
    }
    const hashPassword = await getHash(password);
    const user = await this.accountModel.findOneAndUpdate(
      { phoneNumber },
      { password: hashPassword },
    );
    const accessToken = await this.jsonWebTokenService.sign(user._id);
    return { accessToken };
  }

  private async getPhoneFromToken(token: string): Promise<string> {
    const { isValid, payload } = this.jsonWebTokenService.verify(token);
    if (!isValid) {
      throw new HttpException(
        { verificationToken: 'Invalid token' },
        HttpStatus.BAD_REQUEST,
      );
    }
    const { phoneNumber } = payload as PhoneNumberDto;
    return phoneNumber;
  }

  public async checkPhoneNumberExistence(phoneNumber: string) {
    return this.accountModel.exists({
      phoneNumber,
    });
  }
}
