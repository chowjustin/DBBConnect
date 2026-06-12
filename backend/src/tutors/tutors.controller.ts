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
import { UserRole } from '@prisma/client';
import { TutorsService } from './tutors.service';
import { UpdateTutorDto } from './dto/update-tutor.dto';
import {
  ReviewVerificationDto,
  SubmitVerificationDto,
} from './dto/verification.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { PaginationQueryDto } from '../common/dto/pagination.dto';
import { SearchTutorsQueryDto } from './dto/search-tutors.query.dto';
import { RateSuggestionQueryDto } from './dto/rate-suggestion.query.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('tutors')
export class TutorsController {
  constructor(private readonly tutorsService: TutorsService) {}

  @Get('search')
  async searchTutorsForStudent(
    @Query() query: SearchTutorsQueryDto,
    @Request() req?: any,
  ) {
    return this.tutorsService.search({
      name: query.name,
      subject: query.subject,
      minRate: query.minRate,
      maxRate: query.maxRate,
      minRating: query.minRating,
      educationLevel: query.educationLevel,
      methods: query.methods,
      sortBy: query.sortBy,
      excludeSelf: true,
      email: req?.user?.email,
      pagination: query,
    });
  }

  @Get('collections')
  getCollections() {
    return this.tutorsService.collections();
  }

  @Roles(UserRole.TUTOR)
  @Get('rate-suggestion')
  getRateSuggestion(@Query() query: RateSuggestionQueryDto) {
    return this.tutorsService.rateSuggestion({
      subject: query.subject,
      educationLevel: query.educationLevel,
      experience: query.experience,
    });
  }

  @Get('profile')
  getMyProfile(@Request() req) {
    return this.tutorsService.getProfile(req.user.email);
  }

  @Get('by-id/:id')
  getById(@Param('id') id: string) {
    return this.tutorsService.getById(id);
  }

  @Roles(UserRole.TUTOR)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateTutorDto: UpdateTutorDto,
    @Request() req,
  ) {
    return this.tutorsService.update(id, updateTutorDto, req.user.sub);
  }

  @Get(':email/students')
  async listAllStudents(
    @Param('email') email: string,
    @Query() pagination: PaginationQueryDto,
  ) {
    return this.tutorsService.listAllStudents(email, pagination);
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
  listPending(@Query() pagination: PaginationQueryDto) {
    return this.tutorsService.listPendingVerification(pagination);
  }

  @Roles(UserRole.ADMIN)
  @Patch(':id/verification')
  review(@Param('id') id: string, @Body() dto: ReviewVerificationDto) {
    return this.tutorsService.reviewVerification(id, dto.status, dto.notes);
  }
}
