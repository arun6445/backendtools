import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as FB from 'fb';

import { getHash, compareTextWithHash } from 'helpers/security.util';
import JsonWebTokenService from 'services/json-web-token.service';
import RehiveService from 'services/rehive.service';

import constants from 'app.constants';

import { Account, AccountDocument } from './schemas/account.schema';
import {
  CreateAccountDto,
  PhoneNumberDto,
  ResetPasswordDto,
} from './dto/create-account.dto';
import { SignInAccountDto } from './dto/signin-account.dto';
import { FacebookAccount } from './dto/facebook-account';
import { AccountDto } from './dto/account.dto';

@Injectable()
export class AccountsService {
  constructor(
    @InjectModel(Account.name) private accountModel: Model<AccountDocument>,
    private jsonWebTokenService: JsonWebTokenService,
    private readonly rehiveService: RehiveService,
  ) {}

  private getInfoFromFacebookToken(token: string): Promise<FacebookAccount> {
    return new Promise((res, rej) => {
      FB.api(
        'me',
        { fields: ['name, email'], access_token: token },
        (result) => {
          if (!result || result.error) {
            return rej();
          }
          return res(result);
        },
      );
    });
  }

  private async createUserAccount(
    userInfo,
    oauthProvider,
    objectIdentificator,
    phoneNumber = '',
  ): Promise<AccountDocument> {
    const rehiveUser = await this.rehiveService.createUser();
    if (rehiveUser.status === 'success') {
      const newUser = new this.accountModel({
        _id: rehiveUser.data.id,
        username: userInfo.name || '',
        email: userInfo.email || '',
        phoneNumber,
        oauth: {
          google:
            oauthProvider === constants.OAUTH_PROVIDER.GOOGLE
              ? objectIdentificator.id
              : null,
          facebook:
            oauthProvider === constants.OAUTH_PROVIDER.FACEBOOK
              ? objectIdentificator.id
              : null,
        },
      });
      return newUser.save();
    } else {
      throw new HttpException(
        { credentials: 'User has not been registered' },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  private async updateUser(
    user,
    oauthProvider,
    objectIdentificator,
  ): Promise<AccountDocument> {
    const userFromMongo = await this.accountModel.findOne({ _id: user._id });
    return this.accountModel.findOneAndUpdate(
      { _id: user._id },
      {
        oauth: {
          ...userFromMongo.oauth,
          [oauthProvider]: objectIdentificator.id,
        },
      },
      { new: true },
    );
  }

  public async checkEmailExistence(email: string): Promise<boolean> {
    return this.accountModel.exists({
      email,
    });
  }

  private async ensureAccountCreatedOrCreate(
    userInfo,
    oauthProvider,
    objectIdentificator,
    phoneNumber = '',
  ): Promise<AccountDocument> {
    const searchQuery = {
      [`oauth.${oauthProvider}`]: objectIdentificator.id,
    };
    const user = await this.accountModel.findOne({
      $or: [searchQuery, { email: 'aaa@mail.ru' || null }],
    });

    if (user) {
      return !user.oauth[oauthProvider]
        ? this.updateUser(user, oauthProvider, objectIdentificator)
        : user;
    }

    return this.createUserAccount(
      userInfo,
      oauthProvider,
      objectIdentificator,
      phoneNumber,
    );
  }

  async signUpFacebook(
    facebookAccessToken,
    verificationToken,
  ): Promise<AccountDto> {
    const phoneNumber = await this.getPhoneFromToken(verificationToken);
    const isPhoneNumberExists = await this.checkPhoneNumberExistence(
      phoneNumber,
    );
    if (isPhoneNumberExists) {
      throw new HttpException(
        { phoneNumber: 'This phone is already registered' },
        HttpStatus.BAD_REQUEST,
      );
    }
    return this.processFacebookUser(facebookAccessToken, phoneNumber);
  }

  private async processFacebookUser(
    facebookAccessToken,
    phoneNumber,
  ): Promise<AccountDto> {
    const facebookUser = await this.getInfoFromFacebookToken(
      facebookAccessToken,
    );
    const user = await this.ensureAccountCreatedOrCreate(
      facebookUser,
      constants.OAUTH_PROVIDER.FACEBOOK,
      {
        id: facebookUser.id,
      },
      phoneNumber,
    );

    const accessToken = await this.jsonWebTokenService.sign({
      userId: user._id,
    });
    return AccountDto.fromAccountDocument(user, accessToken);
  }

  async signInFacebook(facebookAccessToken): Promise<AccountDto> {
    return this.processFacebookUser(facebookAccessToken, '');
  }

  public async signIn({
    email,
    password,
  }: SignInAccountDto): Promise<AccountDto> {
    const isEmailExists = await this.checkEmailExistence(email);

    if (!isEmailExists) {
      throw new HttpException(
        { credentials: 'Email or password is not correct' },
        HttpStatus.BAD_REQUEST,
      );
    }
    const user = await this.accountModel.findOne({ email });

    const isCorrectPassword = await compareTextWithHash(
      password,
      user.password,
    );

    if (isCorrectPassword) {
      const accessToken = await this.jsonWebTokenService.sign({
        userId: user._id,
      });
      return AccountDto.fromAccountDocument(user, accessToken);
    } else {
      throw new HttpException(
        { credentials: 'Email or password is not correct' },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  public async resetPassword({
    password,
    verificationToken,
  }: ResetPasswordDto): Promise<AccountDto> {
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
    const accessToken = await this.jsonWebTokenService.sign({
      userId: user._id,
    });
    return AccountDto.fromAccountDocument(user, accessToken);
  }

  async create(createAccountDto: CreateAccountDto): Promise<AccountDto> {
    const isEmailExists = await this.checkEmailExistence(
      createAccountDto.email,
    );
    if (isEmailExists) {
      throw new HttpException(
        { email: 'This email is already registered' },
        HttpStatus.BAD_REQUEST,
      );
    }
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

    const rehiveUser = await this.rehiveService.createUser();
    if (rehiveUser.status === 'success') {
      const password = await getHash(createAccountDto.password);
      const newUser = new this.accountModel({
        _id: rehiveUser.data.id,
        email: createAccountDto.email,
        username: createAccountDto.username,
        phoneNumber,
        password,
        oauth: {
          facebook: '',
          google: '',
        },
      });

      await newUser.save();
      const accessToken = await this.jsonWebTokenService.sign({
        userId: newUser._id,
      });
      return AccountDto.fromAccountDocument(newUser, accessToken);
    } else {
      throw new HttpException(
        { credentials: 'User has not been registered' },
        HttpStatus.BAD_REQUEST,
      );
    }
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

  public async checkPhoneNumberExistence(
    phoneNumber: string,
  ): Promise<boolean> {
    return this.accountModel.exists({
      phoneNumber,
    });
  }
}
