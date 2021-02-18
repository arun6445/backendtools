import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { VerificationToken } from 'auth/dto/tokens.dto';
import * as Twilio from 'twilio';
import { ServiceContext } from 'twilio/lib/rest/verify/v2/service';
import {
  VerificationInstance,
  VerificationStatus,
} from 'twilio/lib/rest/verify/v2/service/verification';

import { JsonWebTokenService } from '../auth/services/jwt.service';

const MAX_SEND_ATTEMPT_REACHED_CODE = 60203;
const VERIFICATION_STATUSES = {
  PENDING: 'pending',
  APPROVED: 'approved',
  CANCELED: 'canceled',
  DENIED: 'denied',
};

@Injectable()
export default class TwilioService {
  private client: Twilio.Twilio;
  private verifyService: ServiceContext;
  private TEST_NUMBER: string;
  private TWILIO_TEST_NUMBER: string;
  private TEST_VERIFICATION_CODE: string;

  constructor(
    configService: ConfigService,
    private jsonWebTokenService: JsonWebTokenService,
  ) {
    const twilioAccountSid = configService.get<string>('TWILIO_ACCOUNT_SID');
    const authToken = configService.get<string>('TWILIO_AUTH_TOKEN');
    const verifyServiceSid = configService.get<string>(
      'TWILIO_VERIFY_SERVICE_SID',
    );
    this.TEST_NUMBER = configService.get<string>('TEST_NUMBER');
    this.TWILIO_TEST_NUMBER = configService.get<string>('TWILIO_TEST_NUMBER');
    this.TEST_VERIFICATION_CODE = configService.get<string>(
      'TEST_VERIFICATION_CODE',
    );
    this.client = Twilio(twilioAccountSid, authToken);
    this.verifyService = this.client.verify.services(verifyServiceSid);
  }

  private async createVerification(
    phoneNumber: string,
    channel = 'sms',
  ): Promise<VerificationInstance> {
    try {
      return await this.verifyService.verifications.create({
        to: phoneNumber,
        channel,
      });
    } catch (error) {
      const { code } = error;
      if (code === MAX_SEND_ATTEMPT_REACHED_CODE) {
        await this.verifyService.verifications(phoneNumber).update({
          status: VERIFICATION_STATUSES.CANCELED as VerificationStatus,
        });
        const verification = await this.verifyService.verifications.create({
          to: phoneNumber,
          channel,
        });
        if (verification.sid) {
          return verification;
        }
      }
      throw new HttpException(
        {
          phoneNumber:
            'Please wait for a short period of time and make the request again',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  private checkTestData(phoneNumber: string, testCode?: string): boolean {
    if (testCode) {
      return (
        testCode === this.TEST_VERIFICATION_CODE &&
        phoneNumber === this.TEST_NUMBER
      );
    }
    return phoneNumber === this.TEST_NUMBER;
  }

  private checkTestPhoneNumber(phoneNumber: string): boolean {
    return phoneNumber === this.TWILIO_TEST_NUMBER;
  }

  async sendSms(senderPhone: string, recipientPhone: string) {
    if (this.checkTestPhoneNumber(senderPhone)) {
      return;
    }
    return await this.client.messages.create({
      body: 'Hi, sms',
      from: senderPhone,
      to: recipientPhone,
    });
  }

  async startVerification(
    phoneNumber: string,
    channel = 'sms',
  ): Promise<VerificationInstance> {
    if (this.checkTestData(phoneNumber)) {
      return;
    }
    const verification = await this.createVerification(phoneNumber, channel);
    if (!verification.sid) {
      throw new HttpException(
        { phoneNumber: 'Phone number is not correct' },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async checkVerification(
    phone: string,
    code: string,
  ): Promise<VerificationToken> {
    if (this.checkTestData(phone, code)) {
      const verificationToken = this.jsonWebTokenService.sign({
        phoneNumber: phone,
      });
      return { verificationToken };
    }

    const status = await this.createVerificationCheck(phone, code);
    if (status !== VERIFICATION_STATUSES.APPROVED) {
      throw new HttpException(
        {
          code: 'The verification phone code is not correct',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    const verificationToken = this.jsonWebTokenService.sign({
      phoneNumber: phone,
    });
    return { verificationToken };
  }

  private async createVerificationCheck(
    phone: string,
    code: string,
  ): Promise<string> {
    try {
      const { status } = await this.verifyService.verificationChecks.create({
        to: phone,
        code,
      });

      return status;
    } catch (e) {
      throw new HttpException(
        { code: 'The error in verification check' },
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
