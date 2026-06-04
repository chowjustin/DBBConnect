import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UploadModule } from './upload/upload.module';
import { UsersModule } from './users/users.module';
import { TutorsModule } from './tutors/tutors.module';
import { StudentsModule } from './students/students.module';
import { ReviewsModule } from './reviews/reviews.module';
import { ApplicationsModule } from './applications/applications.module';
import { MaterialsModule } from './materials/materials.module';

@Module({
  imports: [PrismaModule, UsersModule, AuthModule, UploadModule, TutorsModule, StudentsModule, ReviewsModule, ApplicationsModule, MaterialsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
