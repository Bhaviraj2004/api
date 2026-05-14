import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { UserModule } from './user/user.module';
import { CaModule } from './ca/ca.module';
import { ClientModule } from './client/client.module';
import { DscTokenModule } from './dsc-token/dsc-token.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    AuthModule,
    UserModule,
    CaModule,
    ClientModule,
    DscTokenModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
