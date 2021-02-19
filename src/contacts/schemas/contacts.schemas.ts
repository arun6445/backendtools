import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose'

export type ContactDocument = Contact & Document

@Schema()
export class Contact {
    @Prop()
    ownerId: string;

    @Prop()
    phoneContactName: string;

    @Prop()
    phoneContactPhone: string;
}

export const ContactSchema = SchemaFactory.createForClass(Contact)