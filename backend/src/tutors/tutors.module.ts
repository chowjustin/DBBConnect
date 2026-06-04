import { Module } from '@nestjs/common';
import { TutorsService } from './tutors.service';
import { TutorsController } from './tutors.controller';
import { MailService } from '../mail/mail.service';

@Module({
  controllers: [TutorsController],
  providers: [TutorsService, MailService],
})
export class TutorsModule {}
