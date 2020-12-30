import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { VerifyOptions, verify, VerifyErrors, sign } from 'jsonwebtoken';

export interface VerifyResult<T> {
  isValid: boolean;
  payload?: T;
  error?: VerifyErrors;
}

@Injectable()
export default class JsonWebTokenService {
  private readonly secret: string;

  constructor(private readonly configService: ConfigService) {
    this.secret = configService.get<string>('JWT_SECRET');
  }
  public verify<T>(token: string, options?: VerifyOptions): VerifyResult<T> {
    try {
      const payload = verify(token, this.secret, options);
      return { isValid: true, payload };
    } catch (error) {
      return {
        isValid: false,
        error,
      };
    }
  }

  public sign(
    data: Record<string, any> | string,
    options?: VerifyOptions,
  ): string {
    return sign(data, this.secret, options);
  }
}
