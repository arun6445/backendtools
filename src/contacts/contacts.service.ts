import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { CreateContactDto } from './dto/create-contacts.dto';
import { Contact, ContactDocument } from './schemas/contacts.schemas';

@Injectable()
export class ContactsService {
    constructor(
    @InjectModel(Contact.name)
    private readonly contactModel: Model<ContactDocument>){}

    async getContact(): Promise<Contact[]> {
      return this.contactModel.find().exec()
    }
    
    async create(contactDto: CreateContactDto): Promise<Contact> {
        return new this.contactModel(contactDto);
    }
}
