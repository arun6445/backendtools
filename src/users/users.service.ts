import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import BaseService from 'base/base.service';
import RehiveService from 'rehive/rehive.service';

import { UserDocument } from './model';

@Injectable()
export class UsersService extends BaseService<UserDocument> {
  constructor(
    @InjectModel(UserDocument.name) model: Model<UserDocument>,
    private rehiveService: RehiveService,
  ) {
    super(model);
  }

  getBalance(accountReference: string, currency?: string) {
    return this.rehiveService.getBalance(accountReference, currency);
  }

  getTransactions(userId: string) {
    return this.rehiveService.getTransactions(userId);
  }
}
