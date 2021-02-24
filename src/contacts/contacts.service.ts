import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

import BaseService from 'base/base.service';

import { CreateContactDto } from './dto/create-contacts.dto';
import { Contact, ContactDocument } from './schemas/contacts.schemas';
import { ContactsController } from './contacts.controller';

@Injectable()
export class ContactsService extends BaseService<ContactDocument> {
  constructor(
    @InjectModel(Contact.name)
    private contactModel: Model<ContactDocument>,
  ) {
    super(contactModel);
  }

  async getContacts(ownerId: string) {
    try {
      return await this.contactModel.find({ ownerId });
    } catch (e) {
      throw new HttpException(e.response.data, HttpStatus.BAD_REQUEST);
    }
  }

  async createContactsInDB(userId: string, createContactDto) {
    return createContactDto.map((item) => {
      this.create({
        _id: uuidv4(),
        ownerId: userId,
        phoneContactName: item.givenName,
        phoneContactPhone: item.phoneNumber,
        exist: false,
      });
    });
  }

  async getCrossContacts(userId: string) {
    const contacts = await this.contactModel.aggregate([
      {
        $lookup: {
          from: 'users',
          localField: 'phoneContactPhone',
          foreignField: 'phoneNumber',
          as: 'crossUsers',
        },
      },
    ]);

    contacts
      .filter((item) => {
        return item.ownerId === userId && item.crossUsers[0];
      })
      .map(async (item) => {
        return await this.updateOne({ _id: item._id }, { exist: true });
      });

    const crossContacts = await this.find({
      ownerId: userId,
      exist: true,
    });

    return crossContacts;
  }
}
