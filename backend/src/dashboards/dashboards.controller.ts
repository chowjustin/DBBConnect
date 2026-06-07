import { Controller, Get, Request, UseGuards } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { DashboardsService } from './dashboards.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller()
export class DashboardsController {
  constructor(private readonly svc: DashboardsService) {}

  @Roles(UserRole.TUTOR)
  @Get('dashboards/tutor')
  tutor(@Request() req) {
    return this.svc.tutor(req.user.email);
  }

  @Roles(UserRole.STUDENT)
  @Get('dashboards/student')
  student(@Request() req) {
    return this.svc.student(req.user.email);
  }

  @Roles(UserRole.TUTOR)
  @Get('dashboards/tutor/analytics')
  tutorAnalytics(@Request() req) {
    return this.svc.tutorAnalytics(req.user.email);
  }

  @Roles(UserRole.ADMIN)
  @Get('admin/analytics/overview')
  adminOverview() {
    return this.svc.adminOverview();
  }
}
