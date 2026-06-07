import { Module } from '@nestjs/common';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { PrismaExceptionFilter } from './prisma/prisma-exception.filter';
import { AuthModule } from './auth/auth.module';
import { UploadModule } from './upload/upload.module';
import { UsersModule } from './users/users.module';
import { TutorsModule } from './tutors/tutors.module';
import { StudentsModule } from './students/students.module';
import { ReviewsModule } from './reviews/reviews.module';
import { ApplicationsModule } from './applications/applications.module';
import { MaterialsModule } from './materials/materials.module';
import { AdminModule } from './admin/admin.module';
import { AvailabilityModule } from './availability/availability.module';
import { SessionsModule } from './sessions/sessions.module';
import { PlatformBankModule } from './platform-bank/platform-bank.module';
import { PaymentsModule } from './payments/payments.module';
import { PayoutsModule } from './payouts/payouts.module';
import { SubscriptionModule } from './subscription/subscription.module';
import { FeaturedModule } from './featured/featured.module';
import { PromoModule } from './promo/promo.module';
import { ReferralsModule } from './referrals/referrals.module';
import { DashboardsModule } from './dashboards/dashboards.module';
import { TrackingModule } from './tracking/tracking.module';

@Module({
  imports: [
    ThrottlerModule.forRoot([
      { name: 'default', ttl: 60_000, limit: 100 },
    ]),
    PrismaModule,
    UsersModule,
    AuthModule,
    UploadModule,
    TutorsModule,
    StudentsModule,
    ReviewsModule,
    ApplicationsModule,
    MaterialsModule,
    AdminModule,
    AvailabilityModule,
    SessionsModule,
    PlatformBankModule,
    PaymentsModule,
    PayoutsModule,
    SubscriptionModule,
    FeaturedModule,
    PromoModule,
    ReferralsModule,
    DashboardsModule,
    TrackingModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_FILTER, useClass: PrismaExceptionFilter },
  ],
})
export class AppModule {}
