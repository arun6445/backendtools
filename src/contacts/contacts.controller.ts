import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  UseGuards,
  Param,
} from '@nestjs/common';
import { CreateContactDto } from './dto/create-contacts.dto';
import { ContactsService } from './contacts.service';
import { Contact } from './schemas/contacts.schemas';
import { AuthGuard } from 'auth/guards/auth.guard';
import { AuthRequest } from 'auth/dto/auth-request.dto';

@Controller('contacts')
// @UseGuards(AuthGuard)
export class ContactsController {
  constructor(private contactsService: ContactsService) {}

  @Get('/:ownerId')
  public async getCountContactsFromDB(@Param('ownerId') ownerId: string) {
    return await this.contactsService.getContacts(ownerId);
  }

  @Post('/create/:userId')
  public createContactsInDB(
    @Param('userId') userId: string,
    @Body() createContactDto,
  ) {
    return this.contactsService.createContactsInDB(userId, createContactDto);
  }

  @Get('/cross/:userId')
  public async getCross(@Param('userId') userId: string) {
    return await this.contactsService.getCrossContacts(userId);
  }
}
