import { Module } from '@nestjs/common';
import { TutorsService } from './tutors.service';
import { TutorsController, AdminTutorsController } from './tutors.controller';
import { MailModule } from '../mail/mail.module';
import { TrackingModule } from '../tracking/tracking.module';

@Module({
  imports: [MailModule, TrackingModule],
  controllers: [TutorsController, AdminTutorsController],
  providers: [TutorsService],
  exports: [TutorsService],
})
export class TutorsModule {}
