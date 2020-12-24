import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { VerifyOptions, verify, VerifyErrors, sign } from 'jsonwebtoken';

export interface VerifyResult {
  isValid: boolean;
  // eslint-disable-next-line @typescript-eslint/ban-types
  payload?: object | string;
  error?: VerifyErrors;
}

@Injectable()
export default class JsonWebTokenService {
  private readonly secret: string;

  constructor(private readonly configService: ConfigService) {
    this.secret = configService.get<string>('JWT_SECRET');
  }
  public verify(token: string, options?: VerifyOptions): VerifyResult {
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

  // eslint-disable-next-line @typescript-eslint/ban-types
  public sign(data: string | object, options?: VerifyOptions): string {
    return sign(data, this.secret, options);
  }
}
