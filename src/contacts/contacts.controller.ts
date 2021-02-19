import { Body, Controller, Get, Post, Req } from '@nestjs/common';
import { CreateContactDto } from './dto/create-contacts.dto';
import { ContactsService } from './contacts.service'
import { Contact } from './schemas/contacts.schemas';

@Controller('contacts')
export class ContactsController {
    constructor(private contactsService: ContactsService){}
    @Get()
    public getAll(){
        return this.contactsService.getContact()
    }

    @Post('/create')
    public create(@Body() createContactDto: CreateContactDto): Promise<Contact>{
        return this.contactsService.create(createContactDto)
    }
}
