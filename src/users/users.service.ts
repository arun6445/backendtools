import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, Types } from 'mongoose';

import BaseService from 'base/base.service';
import RehiveService from 'rehive/rehive.service';

import { UserDocument, PhoneNumberDocument, DebitCardDocument } from './model';
import {
  SavedPhoneNumberDto,
  SavedDebitCardDto,
  AddDebitCardDto,
  FindCrossContactsDto,
} from './users.interfaces';

import { compareTextWithHash, getHash } from 'helpers/security.util';
import { RehiveTransactionsFilterOptions } from 'rehive/rehive.interfaces';
import { TransactionsService } from 'transactions/transactions.service';
import { VerifyUserDto } from './dto';

@Injectable()
export class UsersService extends BaseService<UserDocument> {
  constructor(
    @InjectModel(UserDocument.name)
    model: Model<UserDocument>,
    @InjectModel(PhoneNumberDocument.name)
    private readonly phoneNumberModel: Model<PhoneNumberDocument>,
    @InjectModel(DebitCardDocument.name)
    private readonly debitCardModel: Model<DebitCardDocument>,
    private readonly rehiveService: RehiveService,
    private transactionsService: TransactionsService,
  ) {
    super(model);
  }

  async getBalance(accountReference: string, currency?: string) {
    try {
      const balance = await this.rehiveService.getBalance(
        accountReference,
        currency,
      );

      return balance;
    } catch (e) {
      throw new HttpException(e.response.data, HttpStatus.BAD_REQUEST);
    }
  }

  async getTransactions(userId: string, page?: number) {
    const {
      transactions,
      count,
    } = await this.transactionsService.getUserTransactions(userId, page);
    const partnerIds = transactions
      .filter(({ partnerId }) => partnerId !== null)
      .map(({ partnerId }) => partnerId);

    const partners = await this.model.find({
      _id: { $in: [...new Set(partnerIds)] },
    });

    return {
      count,
      transactions: transactions.map((item) => ({
        ...item,
        partner: partners.find(({ _id }) => _id === item.partnerId) || null,
      })),
    };
  }

  getTransactionsTotal(
    userId: string,
    params: Partial<RehiveTransactionsFilterOptions>,
  ) {
    return this.transactionsService.getUserTransactionTotal(userId, {
      currency: 'XOF',
      ...params,
    });
  }

  async getPhoneNumbers(userId: string): Promise<SavedPhoneNumberDto[]> {
    const user = await this.findOneById(userId);
    return user.savedPhoneNumbers;
  }

  async addPhoneNumber(
    userId: string,
    phoneNumber: string,
    phoneOperator: string,
  ): Promise<SavedPhoneNumberDto> {
    const isSavedPhoneNumberExists = await this.checkExistenceInUser(userId, {
      'savedPhoneNumbers.phoneNumber': phoneNumber,
    });

    if (isSavedPhoneNumberExists) {
      throw new HttpException(
        { phoneNumber: 'This phone number is already added' },
        HttpStatus.BAD_REQUEST,
      );
    }

    const { savedPhoneNumbers: phones } = await this.findOneById(userId);
    if (phones.length >= 3) {
      throw new HttpException(
        { phoneNumber: 'You can`t add more then 3 phone numbers' },
        HttpStatus.BAD_REQUEST,
      );
    }

    const newPhoneNumber = new this.phoneNumberModel({
      phoneNumber,
      phoneOperator,
    });

    const { savedPhoneNumbers } = await this.findOneAndUpdate(
      { _id: userId },
      { $push: { savedPhoneNumbers: newPhoneNumber } },
      { new: true },
    );

    return savedPhoneNumbers[savedPhoneNumbers.length - 1];
  }

  async checkExistenceOutUser(
    userId: string,
    query: FilterQuery<UserDocument>,
  ): Promise<boolean> {
    return this.exists({
      _id: { $ne: userId },
      ...query,
    });
  }

  async removePhoneNumber(
    userId: string,
    phoneNumberId: string,
  ): Promise<void> {
    const isPhoneNumberExists = await this.checkExistenceInUser(userId, {
      'savedPhoneNumbers._id': new Types.ObjectId(phoneNumberId),
    });

    if (!isPhoneNumberExists) {
      throw new HttpException(
        { phoneNumber: 'This phone number does not exist' },
        HttpStatus.BAD_REQUEST,
      );
    }

    await this.findOneAndUpdate(
      {
        _id: userId,
        savedPhoneNumbers: {
          $elemMatch: { _id: new Types.ObjectId(phoneNumberId) },
        },
      },
      {
        $pull: {
          savedPhoneNumbers: { _id: new Types.ObjectId(phoneNumberId) },
        },
      },
    );
  }

  async getUserData(userId: string) {
    const userData = await this.findOneById(userId);
    if (!userData) {
      throw new HttpException({ user: 'Not Found' }, HttpStatus.BAD_REQUEST);
    }
    return userData;
  }

  async verifyUser(userId: string, verificationData: VerifyUserDto) {
    const {
      identityAccessKey,
      firstName,
      lastName,
      country,
      birthDate,
    } = verificationData;

    const status = this.rehiveService.getRehiveStatus();
    const data = await this.rehiveService.updateUserKYCStatus(userId, status);

    return this.updateById(userId, {
      firstName,
      lastName,
      country,
      birthDate,
      kyc: {
        status: data.status,
        identityAccessKey,
      },
    });
  }

  async getDebitCards(userId: string): Promise<SavedDebitCardDto[]> {
    const user = await this.findOneById(userId);
    return user.savedDebitCards;
  }

  async getDebitCardById(
    userId: string,
    debitCardId: string,
  ): Promise<SavedDebitCardDto> {
    const user = await this.findOneById(userId);

    return user.savedDebitCards.find(
      (debitCard) => debitCard._id.toString() === debitCardId,
    );
  }

  private async checkExistenceInUser(
    userId: string,
    query: FilterQuery<PhoneNumberDocument>,
  ): Promise<boolean> {
    return this.exists({
      _id: userId,
      ...query,
    });
  }

  async removeDebitCard(userId: string, debitCardId: string): Promise<void> {
    const isDebitCardExists = await this.checkExistenceInUser(userId, {
      'savedDebitCards._id': new Types.ObjectId(debitCardId),
    });

    if (!isDebitCardExists) {
      throw new HttpException(
        { phoneNumber: 'This card doesn`t exist' },
        HttpStatus.BAD_REQUEST,
      );
    }

    await this.updateOne(
      {
        _id: userId,
        savedDebitCards: {
          $elemMatch: { _id: new Types.ObjectId(debitCardId) },
        },
      },
      {
        $pull: {
          savedDebitCards: { _id: new Types.ObjectId(debitCardId) },
        },
      },
    );
  }

  async addDebitCard(
    userId: string,
    cardData: AddDebitCardDto,
  ): Promise<SavedDebitCardDto> {
    const isSavedCardExists = await this.exists({
      'savedDebitCards.cardNumber': cardData.cardNumber,
    });

    if (isSavedCardExists) {
      throw new HttpException(
        {
          cardNumber: 'This debit card has been already added',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    const newDebitCard = new this.debitCardModel(cardData);

    const { savedDebitCards } = await this.findOneAndUpdate(
      { _id: userId },
      { $push: { savedDebitCards: newDebitCard } },
      { new: true },
    );

    return savedDebitCards[savedDebitCards.length - 1];
  }

  async updateUserKYC(identityAccessKey: string, status: string) {
    const user = await this.model.findOne({
      'kyc.identityAccessKey': identityAccessKey,
    });

    if (!user) {
      return { success: false };
    }

    const rehiveStatus = this.rehiveService.getRehiveStatus(status);

    const data = await this.rehiveService.updateUserKYCStatus(
      user._id,
      rehiveStatus,
    );

    await this.model.updateOne(
      { _id: user._id },
      {
        $set: {
          'kyc.status': data.status,
        },
      },
    );

    return { success: true };
  }

  public async updatePhoneNumber(userId: string, phoneNumber: string) {
    const isPhoneExists = await this.checkExistenceOutUser(userId, {
      phoneNumber,
    });

    if (isPhoneExists) {
      throw new HttpException(
        { phoneNumber: 'This phone number is already registered' },
        HttpStatus.BAD_REQUEST,
      );
    }
    const user = await this.updateOne({ _id: userId }, { phoneNumber });
    return user;
  }

  public async resetPassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ): Promise<void> {
    const user = await this.findOne({ _id: userId });

    const isCorrectPassword = await compareTextWithHash(
      currentPassword,
      user.password,
    );

    if (!isCorrectPassword) {
      throw new HttpException(
        { currentPassword: 'Current password is not correct' },
        HttpStatus.BAD_REQUEST,
      );
    }
    const hashNewPassword = await getHash(newPassword);
    await this.updateOne({ _id: userId }, { password: hashNewPassword });
  }

  public getCorrectPhone(phoneNumber: string) {
    return phoneNumber.startsWith('+')
      ? phoneNumber.replace(/[^+\d]+/g, '')
      : `+${phoneNumber.replace(/[^+\d]+/g, '')}`;
  }

  public async findCrossContacts(
    rawListContacts: FindCrossContactsDto[],
  ): Promise<FindCrossContactsDto[]> {
    const rawListContactsPhone = rawListContacts.map((contact) => {
      return this.getCorrectPhone(contact.phoneNumber);
    });

    const rawListCrossContacts = await this.find(
      { phoneNumber: { $in: rawListContactsPhone } },
      { phoneNumber: 1, username: 1 },
    );

    return rawListCrossContacts.map((contact) => {
      const processedListCrossContacts = rawListContacts.find(
        (rawContact) =>
          contact.phoneNumber === this.getCorrectPhone(rawContact.phoneNumber),
      );
      return {
        givenName: processedListCrossContacts.givenName,
        phoneNumber: contact.phoneNumber,
        username: contact.username,
        userId: contact._id,
      };
    });
  }
}
