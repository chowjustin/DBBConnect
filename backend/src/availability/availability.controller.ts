import {
  Body,
  Controller,
  Get,
  Param,
  Put,
  Request,
  UseGuards,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { AvailabilityService } from './availability.service';
import { ReplaceAvailabilityDto } from './dto/availability.dto';

@Controller('tutors')
export class AvailabilityController {
  constructor(private readonly svc: AvailabilityService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.TUTOR)
  @Put('availability')
  replaceMine(@Request() req, @Body() dto: ReplaceAvailabilityDto) {
    return this.svc.replace(req.user.email, dto.slots);
  }

  @Get(':tutorId/availability')
  list(@Param('tutorId') tutorId: string) {
    return this.svc.listForTutor(tutorId);
  }
}
