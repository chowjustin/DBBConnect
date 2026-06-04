import {
  Controller,
  Get,
  Patch,
  Param,
  Request,
  UseGuards,
  Body,
  Query,
} from '@nestjs/common';
import { StudentsService } from './students.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UpdateStudentDto } from './dto/update-student.dto';
import { Subject } from '@prisma/client';

@UseGuards(JwtAuthGuard)
@Controller('students')
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @Get('search-tutors')
  async searchTutors(
    @Query('name') name?: string,
    @Query('subject') subject?: string,
    @Query('minRate') minRate?: string,
    @Query('maxRate') maxRate?: string,
    @Request() req?: any,
  ) {
    const min = minRate ? parseFloat(minRate) : undefined;
    const max = maxRate ? parseFloat(maxRate) : undefined;
    const email = req?.user?.email;

    let validSubject: Subject | undefined;

    if (subject) {
      const upper = subject.toUpperCase();
      if (Object.keys(Subject).includes(upper)) {
        validSubject = upper as Subject;
      }
    }

    return this.studentsService.search(
      name,
      validSubject,
      min,
      max,
      true,
      email,
    );
  }

  @Get('profile')
  getMyProfile(@Request() req) {
    return this.studentsService.getProfile(req.user.email);
  }

  @Patch(':id')
  updateProfile(@Param('id') id: string, @Body() dto: UpdateStudentDto) {
    return this.studentsService.update(id, dto);
  }
}
