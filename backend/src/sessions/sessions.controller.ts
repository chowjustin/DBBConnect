import {
  Body,
  Controller,
  Get,
  Header,
  Param,
  Patch,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { EmailVerified } from '../auth/email-verified.decorator';
import { EmailVerifiedGuard } from '../auth/email-verified.guard';
import { SessionsService } from './sessions.service';
import { CreateSessionDto } from './dto/create-session.dto';
import { UpdateSessionStatusDto } from './dto/update-session-status.dto';
import { CancelSessionDto } from './dto/cancel-session.dto';
import { RescheduleSessionDto } from './dto/reschedule-session.dto';
import { SkipTransform } from '../common/skip-transform.decorator';
import { PaginationQueryDto } from '../common/dto/pagination.dto';
import { ListSessionsQueryDto } from './dto/list-sessions.query.dto';

@UseGuards(JwtAuthGuard, RolesGuard, EmailVerifiedGuard)
@Controller('sessions')
export class SessionsController {
  constructor(private readonly svc: SessionsService) {}

  @EmailVerified()
  @Roles(UserRole.STUDENT)
  @Post()
  create(@Request() req, @Body() dto: CreateSessionDto) {
    return this.svc.create(req.user.email, dto);
  }

  @Roles(UserRole.STUDENT, UserRole.TUTOR)
  @Patch(':id')
  updateStatus(
    @Request() req,
    @Param('id') id: string,
    @Body() dto: UpdateSessionStatusDto,
  ) {
    return this.svc.updateStatus(
      req.user.email,
      req.user.role,
      id,
      dto.status,
    );
  }

  @Roles(UserRole.STUDENT)
  @Get('student')
  listStudent(@Request() req, @Query() query: ListSessionsQueryDto) {
    return this.svc.listForStudent(req.user.email, query, query.past ?? false);
  }

  @Roles(UserRole.TUTOR)
  @Get('tutor')
  listTutor(@Request() req, @Query() query: ListSessionsQueryDto) {
    return this.svc.listForTutor(req.user.email, query, query.past ?? false);
  }

  @Roles(UserRole.STUDENT, UserRole.TUTOR)
  @Patch(':id/cancel')
  cancel(
    @Request() req,
    @Param('id') id: string,
    @Body() dto: CancelSessionDto,
  ) {
    return this.svc.cancel(req.user.sub, req.user.role, id, dto.reason);
  }

  @Roles(UserRole.STUDENT, UserRole.TUTOR)
  @Patch(':id/reschedule')
  reschedule(
    @Request() req,
    @Param('id') id: string,
    @Body() dto: RescheduleSessionDto,
  ) {
    return this.svc.reschedule(
      req.user.sub,
      req.user.role,
      id,
      dto.startsAt,
      dto.endsAt,
    );
  }

  @SkipTransform()
  @Get(':id/ical')
  @Header('Content-Type', 'text/calendar')
  async ical(@Param('id') id: string) {
    return this.svc.ical(id);
  }
}
