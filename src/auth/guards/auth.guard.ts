import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JsonWebTokenService } from 'auth/services/jwt.service';
import { UsersService } from 'users/users.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private jwt: JsonWebTokenService,
    private usersService: UsersService,
    private reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.get<boolean>(
      'isPublic',
      context.getHandler(),
    );

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();

    if (!request || !request.headers.authorization) {
      throw new HttpException('Forbidden', HttpStatus.UNAUTHORIZED);
    }

    const payload = this.validateToken(
      request.headers.authorization.replace('Bearer ', ''),
    );

    return this.validatePayload(request, payload);
  }

  validateToken(auth: string) {
    const decoded = this.jwt.verify<any>(auth);

    if (!decoded.isValid) {
      throw new HttpException('Forbidden', HttpStatus.UNAUTHORIZED);
    }

    return decoded.payload;
  }

  async validatePayload(request: any, payload: any): Promise<boolean> {
    const { userId, account } = payload;

    if (!userId || !account) {
      throw new HttpException('Forbidden', HttpStatus.UNAUTHORIZED);
    }

    const user = await this.usersService.findOneById(userId);

    if (!user) {
      throw new HttpException('Forbidden', HttpStatus.UNAUTHORIZED);
    }

    request.user = user;

    return true;
  }
}
