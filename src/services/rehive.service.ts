import {
  HttpException,
  HttpService,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { RehiveRequestDto } from 'accounts/dto/rehive.dto';

@Injectable()
export default class RehiveService {
  rehiveUrl: string;
  accessToken: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.accessToken = this.configService.get<string>('REHIVE_ACCESS_TOKEN');
    this.rehiveUrl = this.configService.get<string>('REHIVE_URL');
  }

  private async sendRequestToRehive({ method, url, data }: RehiveRequestDto) {
    const headers = { Authorization: `Token ${this.accessToken}` };

    return await this.httpService
      .request({
        method,
        url: `${this.rehiveUrl}${url}`,
        headers,
        data,
      })
      .toPromise();
  }

  public async createUser(): Promise<any> {
    try {
      const { data: userData } = await this.sendRequestToRehive({
        method: 'post',
        url: '/admin/users',
      });
      return userData;
    } catch (e) {
      throw new HttpException(
        { credentials: e.response.data.message },
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
