import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { ReviewsService } from './reviews.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Roles(UserRole.STUDENT)
  @Post(':tutorId')
  async createReview(
    @Request() req,
    @Param('tutorId') tutorId: string,
    @Body() dto: CreateReviewDto,
  ) {
    return this.reviewsService.createReview(req.user.email, tutorId, dto);
  }

  @Roles(UserRole.STUDENT)
  @Patch(':reviewId')
  async updateReview(
    @Request() req,
    @Param('reviewId') reviewId: string,
    @Body() dto: UpdateReviewDto,
  ) {
    return this.reviewsService.updateReview(req.user.email, reviewId, dto);
  }

  @Roles(UserRole.STUDENT)
  @Delete(':reviewId')
  async deleteReview(@Request() req, @Param('reviewId') reviewId: string) {
    await this.reviewsService.deleteReview(req.user.email, reviewId);
    return { message: 'Review successfully deleted' };
  }

  @Get('tutor/:tutorId')
  async getTutorReviews(@Request() req, @Param('tutorId') tutorId: string) {
    return this.reviewsService.getTutorReviews(tutorId, req.user?.email);
  }

  @Get('tutor/:tutorEmail/average')
  async getTutorAverageRatingByEmail(@Param('tutorEmail') tutorEmail: string) {
    return this.reviewsService.getTutorAverageRating(tutorEmail);
  }
}
