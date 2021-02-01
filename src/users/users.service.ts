import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import BaseService from 'base/base.service';
import RehiveService from 'rehive/rehive.service';

import { UserDocument, PhoneNumberDocument } from './model';
import { SavedPhoneNumberDto } from './users.interfaces';

@Injectable()
export class UsersService extends BaseService<UserDocument> {
  constructor(
    @InjectModel(UserDocument.name)
    model: Model<UserDocument>,
    @InjectModel(PhoneNumberDocument.name)
    private readonly phoneNumberModel: Model<PhoneNumberDocument>,
    private readonly rehiveService: RehiveService,
  ) {
    super(model);
  }

  getBalance(accountReference: string, currency?: string) {
    return this.rehiveService.getBalance(accountReference, currency);
  }

  getTransactions(userId: string) {
    return this.rehiveService.getTransactions(userId);
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
    const isSavedPhoneNumberExists = await this.exists({
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

  async removePhoneNumber(
    userId: string,
    phoneNumberId: string,
  ): Promise<void> {
    const result = await this.updateOne(
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
    if (result.n === 0) {
      throw new HttpException(
        { phoneNumber: 'This phone number does`t exist' },
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
