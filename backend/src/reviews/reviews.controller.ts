import {
  Controller,
  Post,
  Patch,
  Delete,
  Get,
  Param,
  Body,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';

@UseGuards(JwtAuthGuard)
@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  // Create a review for a tutor
  @Post(':tutorId')
  async createReview(
    @Request() req,
    @Param('tutorId') tutorId: string,
    @Body() dto: CreateReviewDto,
  ) {
    return this.reviewsService.createReview(req.user.email, tutorId, dto);
  }

  // Update a review (student must own it)
  @Patch(':reviewId')
  async updateReview(
    @Request() req,
    @Param('reviewId') reviewId: string,
    @Body() dto: UpdateReviewDto,
  ) {
    return this.reviewsService.updateReview(req.user.email, reviewId, dto);
  }

  // Delete a review (student must own it)
  @Delete(':reviewId')
  async deleteReview(@Request() req, @Param('reviewId') reviewId: string) {
    await this.reviewsService.deleteReview(req.user.email, reviewId);
    return { message: 'Review successfully deleted' };
  }

  // List all reviews for a tutor
  @Get('tutor/:tutorId')
  async getTutorReviews(@Param('tutorId') tutorId: string) {
    return this.reviewsService.getTutorReviews(tutorId);
  }

  // Controller
  @Get('tutor/:tutorEmail/average')
  async getTutorAverageRatingByEmail(@Param('tutorEmail') tutorEmail: string) {
    return this.reviewsService.getTutorAverageRating(tutorEmail);
  }

}
