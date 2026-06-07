import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import {
  EducationLevel,
  Subject,
  TeachingMethod,
  UserRole,
} from '@prisma/client';
import { TutorsService } from './tutors.service';
import { UpdateTutorDto } from './dto/update-tutor.dto';
import {
  ReviewVerificationDto,
  SubmitVerificationDto,
} from './dto/verification.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('tutors')
export class TutorsController {
  constructor(private readonly tutorsService: TutorsService) {}

  @Get('search')
  async searchTutorsForStudent(
    @Query('name') name?: string,
    @Query('subject') subject?: string,
    @Query('minRate') minRate?: string,
    @Query('maxRate') maxRate?: string,
    @Query('minRating') minRating?: string,
    @Query('educationLevel') educationLevel?: string,
    @Query('methods') methods?: string,
    @Query('sortBy') sortBy?: string,
    @Request() req?: any,
  ) {
    const min = minRate ? parseFloat(minRate) : undefined;
    const max = maxRate ? parseFloat(maxRate) : undefined;
    const minRatingNum = minRating ? parseFloat(minRating) : undefined;
    const email = req?.user?.email;

    const validSubject = subject && Object.keys(Subject).includes(subject.toUpperCase())
      ? (subject.toUpperCase() as Subject)
      : undefined;
    const validLevel = educationLevel && Object.keys(EducationLevel).includes(educationLevel.toUpperCase())
      ? (educationLevel.toUpperCase() as EducationLevel)
      : undefined;
    const methodArr = methods
      ? methods.split(',')
          .map((m) => m.toUpperCase())
          .filter((m): m is TeachingMethod => Object.keys(TeachingMethod).includes(m))
      : undefined;
    const validSort = ['rating', 'priceAsc', 'priceDesc', 'featured'].includes(
      sortBy ?? '',
    )
      ? (sortBy as any)
      : undefined;

    return this.tutorsService.search({
      name,
      subject: validSubject,
      minRate: min,
      maxRate: max,
      minRating: minRatingNum,
      educationLevel: validLevel,
      methods: methodArr,
      sortBy: validSort,
      excludeSelf: true,
      email,
    });
  }

  @Get('collections')
  getCollections() {
    return this.tutorsService.collections();
  }

  @Roles(UserRole.TUTOR)
  @Get('rate-suggestion')
  getRateSuggestion(
    @Query('subject') subject?: string,
    @Query('educationLevel') educationLevel?: string,
    @Query('experience') experience?: string,
  ) {
    return this.tutorsService.rateSuggestion({
      subject: subject && Object.keys(Subject).includes(subject.toUpperCase())
        ? (subject.toUpperCase() as Subject)
        : undefined,
      educationLevel:
        educationLevel && Object.keys(EducationLevel).includes(educationLevel.toUpperCase())
          ? (educationLevel.toUpperCase() as EducationLevel)
          : undefined,
      experience: experience ? parseInt(experience, 10) : undefined,
    });
  }

  @Get('profile')
  getMyProfile(@Request() req) {
    return this.tutorsService.getProfile(req.user.email);
  }

  @Roles(UserRole.TUTOR)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateTutorDto: UpdateTutorDto,
  ) {
    return this.tutorsService.update(id, updateTutorDto);
  }

  @Get(':email/students')
  async listAllStudents(@Param('email') email: string) {
    return this.tutorsService.listAllStudents(email);
  }

  @Roles(UserRole.TUTOR)
  @Delete('students/:studentId')
  async removeStudent(@Param('studentId') studentId: string, @Request() req) {
    return this.tutorsService.removeStudent(req.user.email, studentId);
  }

  @Roles(UserRole.TUTOR)
  @Get('me/completeness')
  getCompleteness(@Request() req) {
    return this.tutorsService.getCompleteness(req.user.email);
  }

  @Roles(UserRole.TUTOR)
  @Post('publish')
  publish(@Request() req) {
    return this.tutorsService.publish(req.user.email);
  }

  @Roles(UserRole.TUTOR)
  @Post('unpublish')
  unpublish(@Request() req) {
    return this.tutorsService.unpublish(req.user.email);
  }

  @Roles(UserRole.TUTOR)
  @Post('verification')
  submitVerification(@Request() req, @Body() dto: SubmitVerificationDto) {
    return this.tutorsService.submitVerification(
      req.user.email,
      dto.idDocumentUrl,
      dto.educationProofUrl,
    );
  }
}

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin/tutors')
export class AdminTutorsController {
  constructor(private readonly tutorsService: TutorsService) {}

  @Roles(UserRole.ADMIN)
  @Get('verification')
  listPending() {
    return this.tutorsService.listPendingVerification();
  }

  @Roles(UserRole.ADMIN)
  @Patch(':id/verification')
  review(@Param('id') id: string, @Body() dto: ReviewVerificationDto) {
    return this.tutorsService.reviewVerification(id, dto.status, dto.notes);
  }
}
