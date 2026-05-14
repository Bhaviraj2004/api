import { Module } from '@nestjs/common';
import { DscTokenService } from './dsc-token.service';
import { DscTokenController } from './dsc-token.controller';

@Module({
  controllers: [DscTokenController],
  providers: [DscTokenService],
  exports: [DscTokenService],
})
export class DscTokenModule {}
