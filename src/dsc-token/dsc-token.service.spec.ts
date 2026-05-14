import { Test, TestingModule } from '@nestjs/testing';
import { DscTokenService } from './dsc-token.service';

describe('DscTokenService', () => {
  let service: DscTokenService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DscTokenService],
    }).compile();

    service = module.get<DscTokenService>(DscTokenService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
