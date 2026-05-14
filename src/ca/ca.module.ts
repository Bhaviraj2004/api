import { Module } from '@nestjs/common';
import { CaService } from './ca.service';
import { CaController } from './ca.controller';

@Module({
  controllers: [CaController],
  providers: [CaService],
  exports: [CaService],
})
export class CaModule {}
