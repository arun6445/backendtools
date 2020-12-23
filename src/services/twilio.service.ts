import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Twilio from 'twilio';
import { ServiceContext } from 'twilio/lib/rest/verify/v2/service';
import {
  VerificationInstance,
  VerificationStatus,
} from 'twilio/lib/rest/verify/v2/service/verification';

const MAX_SEND_ATTEMPT_REACHED_CODE = 60203;
const VERIFICATION_STATUSES = {
  PENDING: 'pending',
  APPROVED: 'approved',
  CANCELED: 'canceled',
  DENIED: 'denied',
};
const TEST_NUMBER = '+11111111111';
const TEST_VERIFICATION_SID = 'TEST_VERIFICATION_SID';

@Injectable()
export class TwilioService {
  private client: Twilio.Twilio;
  private verifyService: ServiceContext;

  constructor(configService: ConfigService) {
    const twilioAccountSid = configService.get<string>('TWILIO_ACCOUNT_SID');
    const authToken = configService.get<string>('TWILIO_AUTH_TOKEN');
    const verifyServiceSid = configService.get<string>(
      'TWILIO_VERIFY_SERVICE_SID',
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
        { phoneNumber: 'Phone number is not correct' },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async startVerification(phoneNumber: string, channel = 'sms') {
    if (phoneNumber === TEST_NUMBER) {
      return Promise.resolve({ sid: TEST_VERIFICATION_SID });
    }
    const verification = await this.createVerification(phoneNumber, channel);
    if (!verification.sid) {
      throw new HttpException(
        { phoneNumber: 'Phone number is not correct' },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async checkVerification(phone: string, code: string) {
    const status = await this.createVerificationCheck(phone, code);
    if (status !== VERIFICATION_STATUSES.APPROVED) {
      throw new HttpException(
        {
          twilioCode: 'The verification phone code is not correct',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  private async createVerificationCheck(phone: string, code: string) {
    try {
      const { status } = await this.verifyService.verificationChecks.create({
        to: phone,
        code,
      });

      return status;
    } catch (e) {
      throw new HttpException(
        { twilioCode: 'The error in verification check' },
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
