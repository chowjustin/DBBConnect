import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { PlatformBankController } from './platform-bank.controller';
import { PlatformBankService } from './platform-bank.service';

@Module({
  imports: [AuthModule],
  controllers: [PlatformBankController],
  providers: [PlatformBankService],
  exports: [PlatformBankService],
})
export class PlatformBankModule {}
