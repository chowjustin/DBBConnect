import { Controller, Get, Patch, Param, Query, UseGuards, Body, Request, Delete } from '@nestjs/common';
import { TutorsService } from './tutors.service';
import { UpdateTutorDto } from './dto/update-tutor.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Subject } from '@prisma/client';

@Controller('tutors')
export class TutorsController {
  constructor(private readonly tutorsService: TutorsService) {}

  // Search tutors by subject with optional minRate, maxRate
  @UseGuards(JwtAuthGuard)
  @Get('search')
  async searchTutorsForStudent(
    @Query('name') name?: string,
    @Query('subject') subject?: string,
    @Query('minRate') minRate?: string,
    @Query('maxRate') maxRate?: string,
    @Request() req?: any,
  ) {
    const min = minRate ? parseFloat(minRate) : undefined;
    const max = maxRate ? parseFloat(maxRate) : undefined;
    const email = req?.user?.email; // logged-in student's email

    let validSubject: keyof typeof Subject | undefined;
    if (subject) {
      const upper = subject.toUpperCase();
      if (Object.keys(Subject).includes(upper)) {
        validSubject = upper as keyof typeof Subject;
      }
    }

    return this.tutorsService.search(
      name,
      validSubject,
      min,
      max,
      true, // could be excludeSelf if necessary
      email,
    );
  }



  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getMyProfile(@Request() req) {
    return this.tutorsService.getProfile(req.user.email);
  }


  // Update tutor profile (protected)
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateTutorDto: UpdateTutorDto) {
    return this.tutorsService.update(id, updateTutorDto);
  }

  // List all students the tutor currently teaches
  @UseGuards(JwtAuthGuard)
  @Get(':email/students')
  async listAllStudents(@Param('email') email: string) {
    return this.tutorsService.listAllStudents(email);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('students/:studentId')
  async removeStudent(@Param('studentId') studentId: string, @Request() req) {
    const tutorEmail = req.user.email; 
    return this.tutorsService.removeStudent(tutorEmail, studentId);
  }

}
