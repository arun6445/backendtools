import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import * as FB from 'fb';

import { getHash, compareTextWithHash } from 'helpers/security.util';
import { JsonWebTokenService } from 'auth/services/jwt.service';

import constants from 'app.constants';

import {
  CreateAccountDto,
  PhoneNumberDto,
  ResetPasswordDto,
  CreateAccountError,
} from './dto/create-account.dto';
import { SignInAccountDto } from './dto/signin-account.dto';
import { FacebookAccount } from './dto/facebook-account';
import { AccountDto } from './dto/account.dto';
import { UsersService } from 'users/users.service';
import RehiveService from 'rehive/rehive.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
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
  ) {
    try {
      const rehiveUser = await this.rehiveService.createUser();

      return this.usersService.create({
        _id: rehiveUser.id,
        account: rehiveUser.account,
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
    } catch (e) {
      throw new HttpException(
        { credentials: 'User has not been registered' },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  private async updateUser(user, oauthProvider, objectIdentificator) {
    const userFromMongo = await this.usersService.findOneById(user._id);
    return this.usersService.findOneAndUpdate(
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
    return this.usersService.exists({
      email,
    });
  }

  public async checkUsernameExistence(username: string): Promise<boolean> {
    return this.usersService.exists({
      username,
    });
  }

  private async ensureAccountCreatedOrCreate(
    userInfo,
    oauthProvider,
    objectIdentificator,
    phoneNumber = '',
  ) {
    const searchQuery = {
      [`oauth.${oauthProvider}`]: objectIdentificator.id,
    };
    const user = await this.usersService.findOne(searchQuery);

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
      account: user.account,
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

    const user = await this.usersService.findOne({ email });

    const isCorrectPassword = await compareTextWithHash(
      password,
      user.password,
    );

    if (isCorrectPassword) {
      const accessToken = await this.jsonWebTokenService.sign({
        userId: user._id,
        account: user.account,
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
    const user = await this.usersService.updateOne(
      { phoneNumber },
      { password: hashPassword },
    );
    const accessToken = await this.jsonWebTokenService.sign({
      userId: user._id,
      account: user.account,
    });
    return AccountDto.fromAccountDocument(user, accessToken);
  }

  private async validateCreateAccount(
    email: string,
    username: string,
    phoneNumber: string,
  ): Promise<void> {
    const errors: CreateAccountError = {};

    const [isEmailExist, isUsernameExist, isPhoneExists] = await Promise.all([
      this.checkEmailExistence(email),
      this.checkUsernameExistence(username),
      this.checkPhoneNumberExistence(phoneNumber),
    ]);

    if (isEmailExist) {
      errors.email = 'This email is already registered';
    }

    if (isUsernameExist) {
      errors.username = 'This username is already registered';
    }

    if (isPhoneExists) {
      errors.phoneNumber = 'This phone is already registered';
    }

    if (isEmailExist || isUsernameExist || isPhoneExists) {
      throw new HttpException(errors, HttpStatus.BAD_REQUEST);
    }
  }

  async create(createAccountDto: CreateAccountDto): Promise<AccountDto> {
    const phoneNumber = this.getPhoneFromToken(
      createAccountDto.verificationToken,
    );

    await this.validateCreateAccount(
      createAccountDto.email,
      createAccountDto.username,
      phoneNumber,
    );

    try {
      const rehiveUser = await this.rehiveService.createUser();
      const password = await getHash(createAccountDto.password);
      const newUser = await this.usersService.create({
        _id: rehiveUser.id,
        account: rehiveUser.account,
        email: createAccountDto.email,
        username: createAccountDto.username,
        phoneNumber,
        password,
        oauth: {
          facebook: '',
          google: '',
        },
      });

      const accessToken = this.jsonWebTokenService.sign({
        userId: newUser._id,
        account: newUser.account,
      });

      return AccountDto.fromAccountDocument(newUser, accessToken);
    } catch (e) {
      throw new HttpException(
        { credentials: 'User has not been registered' },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  private getPhoneFromToken(token: string): string {
    const {
      isValid,
      payload,
    } = this.jsonWebTokenService.verify<PhoneNumberDto>(token);
    if (!isValid) {
      throw new HttpException(
        { verificationToken: 'Invalid token' },
        HttpStatus.BAD_REQUEST,
      );
    }
    const { phoneNumber } = payload;
    return phoneNumber;
  }

  public async checkPhoneNumberExistence(
    phoneNumber: string,
  ): Promise<boolean> {
    return this.usersService.exists({
      phoneNumber,
    });
  }
}
