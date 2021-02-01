import { Request } from 'express';
import { AccountDto } from './account.dto';

export type AuthRequest = Request & { user: AccountDto };
