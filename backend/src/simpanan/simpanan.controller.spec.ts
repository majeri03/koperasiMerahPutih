import { Test, TestingModule } from '@nestjs/testing';
import { SimpananController } from './simpanan.controller';

describe('SimpananController', () => {
  let controller: SimpananController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SimpananController],
    }).compile();

    controller = module.get<SimpananController>(SimpananController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
