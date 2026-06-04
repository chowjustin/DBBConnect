import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';

@Injectable()
export class ReviewsService {
  constructor(private prisma: PrismaService) {}

  // create a review (student must have an accepted application with the tutor)
  async createReview(email: string, tutorId: string, dto: CreateReviewDto) {
    const student = await this.prisma.user.findUnique({
      where: { email },
      include: { studentProfile: true },
    });

    if (!student?.studentProfile)
      throw new NotFoundException('Student profile not found');

    const tutor = await this.prisma.tutorProfile.findUnique({
      where: { id: tutorId },
    });

    if (!tutor) throw new NotFoundException('Tutor not found');

    // Check if the student has an accepted application
    const acceptedApp = await this.prisma.application.findFirst({
      where: {
        tutorId,
        studentId: student.studentProfile.id,
        status: 'ACCEPTED',
      },
    });

    if (!acceptedApp)
      throw new ForbiddenException(
        'You can only review a tutor you have an accepted lesson with',
      );

    return this.prisma.review.create({
      data: {
        rating: dto.rating,
        comment: dto.comment,
        tutorId,
        studentId: student.studentProfile.id,
      },
      include: {
        tutor: true,
        student: { include: { user: true } },
      },
    });
  }

  // update review (student must own the review)
  async updateReview(email: string, reviewId: string, dto: UpdateReviewDto) {
    const review = await this.prisma.review.findUnique({
      where: { id: reviewId },
      include: {
        student: { include: { user: true } },
      },
    });

    if (!review) throw new NotFoundException('Review not found');

    if (review.student.user.email !== email)
      throw new ForbiddenException('You can only update your own review');

    return this.prisma.review.update({
      where: { id: reviewId },
      data: {
        rating: dto.rating ?? review.rating,
        comment: dto.comment ?? review.comment,
      },
    });
  }

  // delete review (student must own the review)
  async deleteReview(email: string, reviewId: string) {
    const review = await this.prisma.review.findUnique({
      where: { id: reviewId },
      include: {
        student: { include: { user: true } },
      },
    });

    if (!review) throw new NotFoundException('Review not found');

    if (review.student.user.email !== email)
      throw new ForbiddenException('You can only delete your own review');

    return this.prisma.review.delete({
      where: { id: reviewId },
    });
  }

  // list all reviews for a tutor
  async getTutorReviews(tutorId: string) {
    const tutor = await this.prisma.tutorProfile.findUnique({
      where: { id: tutorId },
    });

    if (!tutor) throw new NotFoundException('Tutor not found');

    return this.prisma.review.findMany({
      where: { tutorId },
      orderBy: { createdAt: 'desc' },
      include: {
        student: { include: { user: true } },
      },
    });
  }

  async getTutorAverageRating(tutorEmail: string) {
    // const tutor = await this.prisma.tutorProfile.findUnique({ where: { id: tutorId } });
    // if (!tutor) throw new NotFoundException('Tutor not found');

    // const result = await this.prisma.review.aggregate({
    //   where: { tutorId },
    //   _avg: { rating: true },
    // });

    // return {
    //   tutorId,
    //   averageRating: result._avg.rating || 0,
    // };
    const user = await this.prisma.user.findUnique({
    where: { email: tutorEmail },
    include: { tutorProfile: true },
  });

  if (!user || !user.tutorProfile) {
    throw new NotFoundException('Tutor not found');
  }

  const tutorId = user.tutorProfile.id;

  const result = await this.prisma.review.aggregate({
    where: { tutorId },
    _avg: { rating: true },
  });

  return {
    tutorEmail,
    averageRating: result._avg.rating || 0,
  };
  }

}
