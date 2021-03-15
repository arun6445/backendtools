import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  IntouchProvider,
  INTOUCH_SERVICE,
  PARTNER_ID,
} from './intouch.constants';
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
    baseUrl = this.baseUrl,
  }: {
    body: any;
    method: string;
    uri: string;
    baseUrl?: string;
    params?: any;
  }) {
    if (process.env.APP_ENV === 'development') {
      return Promise.resolve({});
    }

    return rp({
      method,
      auth: {
        user: this.authUsername,
        pass: this.authPassword,
        sendImmediately: false,
      },
      uri: `${baseUrl}${uri}`,
      body,
      qs: {
        loginAgent: this.loginAgent,
        passwordAgent: this.passwordAgent,
        ...params,
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

  async withdrawal(
    partnerTransactionId: string,
    amount: number,
    provider: string,
    phoneNumber: string,
  ) {
    return this.makeRequest({
      method: 'POST',
      baseUrl: `https://api.gutouch.com/v1/${this.provider}`,
      uri: '/cashin',
      body: {
        partner_transaction_id: partnerTransactionId,
        amount: amount,
        call_back_url: this.callbackUrl,
        login_api: this.loginAgent,
        password_api: this.passwordAgent,
        partner_id: PARTNER_ID,
        service_id: INTOUCH_SERVICE[provider.toUpperCase()]['CASHOUT'],
        recipient_phone_number: phoneNumber,
      },
    });
  }
}
