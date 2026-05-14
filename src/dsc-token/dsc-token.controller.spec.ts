import { Test, TestingModule } from '@nestjs/testing';
import { DscTokenController } from './dsc-token.controller';

describe('DscTokenController', () => {
  let controller: DscTokenController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DscTokenController],
    }).compile();

    controller = module.get<DscTokenController>(DscTokenController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
