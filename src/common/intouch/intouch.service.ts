import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IntouchProvider, INTOUCH_SERVICE } from './intouch.constants';
import * as rp from 'request-promise';

@Injectable()
export default class InTouchService {
  private readonly provider: string;
  private readonly authUsername: string;
  private readonly authPassword: string;
  private readonly loginAgent: string;
  private readonly passwordAgent: string;
  private readonly callbackUrl: string;

  private readonly baseUrl: string;

  constructor(private readonly configService: ConfigService) {
    this.provider = this.configService.get<string>('INTOUCH_PROVIDER');
    this.authUsername = this.configService.get<string>('INTOUCH_AUTH_USERNAME');
    this.authPassword = this.configService.get<string>('INTOUCH_AUTH_PASSWORD');
    this.loginAgent = this.configService.get<string>('INTOUCH_LOGIN_AGENT');
    this.passwordAgent = this.configService.get<string>(
      'INTOUCH_PASSWORD_AGENT',
    );
    this.callbackUrl = this.configService.get<string>('INTOUCH_CALLBACK');

    this.baseUrl = `https://api.gutouch.com/dist/api/touchpayapi/v1/${this.provider}`;
  }

  private makeRequest({
    body,
    method,
    uri,
    params,
  }: {
    body: any;
    method: string;
    uri: string;
    params?: any;
  }) {
    if (process.env.APP_ENV === 'development') {
      return Promise.resolve();
    }

    return rp({
      method,
      auth: {
        user: this.authUsername,
        pass: this.authPassword,
        sendImmediately: false,
      },
      uri: `${this.baseUrl}${uri}`,
      body,
      qs: {
        ...params,
        loginAgent: this.loginAgent,
        passwordAgent: this.passwordAgent,
      },
      json: true,
    });
  }

  async collectFundsFromMobileMoney(
    idFromClient: string,
    amount: number,
    provider: IntouchProvider,
    recipientNumber: string,
    otp: string,
  ) {
    const body = {
      idFromClient,
      amount,
      recipientNumber,
      serviceCode: INTOUCH_SERVICE[provider.toUpperCase()]['CASHIN'],
      callback: this.callbackUrl,
      additionnalInfos: {
        destinataire: recipientNumber,
        otp,
      },
    };

    const data = await this.makeRequest({
      body,
      uri: '/transaction',
      method: 'PUT',
    });

    return data;
  }

  async buyAirtime(
    idFromClient: string,
    amount: number,
    provider: IntouchProvider,
    recipientNumber: string,
  ) {
    const body = {
      idFromClient,
      amount,
      recipientNumber,
      serviceCode: INTOUCH_SERVICE[provider.toUpperCase()]['AIRTIME'],
      callback: this.callbackUrl,
    };

    const data = await this.makeRequest({
      body,
      uri: '/transaction',
      method: 'PUT',
    });

    return data;
  }
}
