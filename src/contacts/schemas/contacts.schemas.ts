import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose'

import BaseDocument from 'base/base.document';

export type ContactDocument = Contact & Document

@Schema()
export class Contact extends BaseDocument{
    @Prop()
    ownerId: string;

    @Prop()
    phoneContactName: string;

    @Prop()
    phoneContactPhone: string;

    @Prop()
    exist: boolean;

}

export const ContactSchema = SchemaFactory.createForClass(Contact)
