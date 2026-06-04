import {
  Controller,
  Post,
  Patch,
  Get,
  Delete,
  Param,
  Body,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApplicationsService } from './applications.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateApplicationStatusDto } from './dto/update-application.dto';

@UseGuards(JwtAuthGuard)
@Controller('applications')
export class ApplicationsController {
  constructor(private readonly apps: ApplicationsService) {}

  // student applies
  @Post()
  apply(@Request() req, @Body() dto: CreateApplicationDto) {
    return this.apps.apply(req.user.email, dto.tutorId);
  }

  // student cancels
  @Delete(':id')
  cancel(@Request() req, @Param('id') id: string) {
    return this.apps.cancel(req.user.email, id);
  }

  // student views own apps
  @Get('student')
  listForStudent(@Request() req) {
    return this.apps.listForStudent(req.user.email);
  }

  // tutor sees apps sent to them
  @Get('tutor')
  listForTutor(@Request() req) {
    return this.apps.listForTutor(req.user.email);
  }

  // tutor updates status
  @Patch(':id/status')
  updateStatus(
    @Request() req,
    @Param('id') id: string,
    @Body() dto: UpdateApplicationStatusDto,
  ) {
    return this.apps.updateStatus(req.user.email, id, dto.status);
  }
}
