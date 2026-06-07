import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { UserRole } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { TrackingService } from './tracking.service';

class ViewDto {
  @IsOptional() @IsInt() @Min(0)
  durationSec?: number;
}

class FeedbackDto {
  @IsInt() @Min(0) @Max(10)
  score: number;

  @IsOptional() @IsString()
  comment?: string;
}

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller()
export class TrackingController {
  constructor(private readonly svc: TrackingService) {}

  @Roles(UserRole.STUDENT)
  @Post('materials/:id/view')
  view(@Param('id') id: string, @Request() req, @Body() dto: ViewDto) {
    return this.svc.logMaterialView(id, req.user.email, dto.durationSec);
  }

  @Roles(UserRole.STUDENT)
  @Post('sessions/:id/feedback')
  feedback(@Param('id') id: string, @Request() req, @Body() dto: FeedbackDto) {
    return this.svc.submitFeedback(id, req.user.email, dto.score, dto.comment);
  }

  @Roles(UserRole.ADMIN)
  @Get('admin/analytics/nps')
  nps() {
    return this.svc.npsLast30Days();
  }

  @Roles(UserRole.ADMIN)
  @Get('admin/analytics/search-gaps')
  searchGaps() {
    return this.svc.searchGaps();
  }
}
