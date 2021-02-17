import { Test, TestingModule } from '@nestjs/testing';
import { IntouchController } from './intouch.controller';

describe('IntouchController', () => {
  let controller: IntouchController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [IntouchController],
    }).compile();

    controller = module.get<IntouchController>(IntouchController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
