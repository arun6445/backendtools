import { Test, TestingModule } from '@nestjs/testing';
import { IntouchService } from './intouch.service';

describe('IntouchService', () => {
  let service: IntouchService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [IntouchService],
    }).compile();

    service = module.get<IntouchService>(IntouchService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
