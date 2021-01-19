import { Method } from 'axios';

export interface RehiveRequestDto {
  method: Method;
  url: string;
  data?: any;
}
