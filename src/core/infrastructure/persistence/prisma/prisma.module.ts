import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from './prisma.service';

@Global()
@Module({
  providers: [
    {
      provide: PrismaService,
      useFactory: (configService: ConfigService) => {
        const url = configService.get<string>('DATABASE_URL');
        return new PrismaService(url!);
      },
      inject: [ConfigService],
    },
  ],
  exports: [PrismaService],
})
export class PrismaModule {}
