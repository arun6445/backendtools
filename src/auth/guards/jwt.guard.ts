import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { JsonWebTokenService } from 'auth/services/jwt.service';

abstract class JwtGuard implements CanActivate {
  constructor(private jwt: JsonWebTokenService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    if (!request || !request.headers.authorization) {
      return false;
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

  abstract validatePayload(
    request: any,
    payload: any,
  ): Promise<boolean> | boolean;
}

export default JwtGuard;
