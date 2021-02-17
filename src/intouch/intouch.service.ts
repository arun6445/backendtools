import { HttpService, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config/dist/config.service';
import { BuyAirtimeDto } from './dto/buy-airtime.dto';
import { CollectMobileMoneyDto } from './dto/collect-mobile-money.dto';
import { IntouchStatusDto } from './dto/intouch-status.dto';
import { MobileMoneyTransferDto } from './dto/mobile-money-transfer.dto';

@Injectable()
export class IntouchService {
    constructor(
        private readonly httpService: HttpService,
        private readonly configService: ConfigService,
      ) {
       
      }
    
  public async collectFromMobileMoneyAccount(
    collectMobileMoneyDto: CollectMobileMoneyDto,
  
  ): Promise<IntouchStatusDto> {
   return Promise.reject(null)
}
public async placeAirtimeBuyOrder(
    buyAirtimeDto: BuyAirtimeDto,

  ): Promise<IntouchStatusDto> {
   return Promise.reject(null)
}

public async disburseToMobileMoneyAccount(
    disburseToMobileMoneyDto: MobileMoneyTransferDto,

  ): Promise<IntouchStatusDto> {
   return Promise.reject(null)
}
}
