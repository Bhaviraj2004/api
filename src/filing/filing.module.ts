import { Module } from '@nestjs/common';
import { FilingService } from './filing.service';
import { FilingController } from './filing.controller';

@Module({
  controllers: [FilingController],
  providers: [FilingService],
  exports: [FilingService],
})
export class FilingModule {}
