import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';

const SAFE_USER_SELECT = {
  id: true,
  name: true,
  email: true,
  role: true,
} satisfies Prisma.UserSelect;

@Injectable()
export class ReviewsService {
  constructor(private prisma: PrismaService) {}

  async createReview(email: string, tutorId: string, dto: CreateReviewDto) {
    const student = await this.prisma.user.findUnique({
      where: { email },
      include: { studentProfile: true },
    });
    if (!student?.studentProfile) {
      throw new NotFoundException('Student profile not found');
    }

    const tutor = await this.prisma.tutorProfile.findUnique({
      where: { id: tutorId },
    });
    if (!tutor) throw new NotFoundException('Tutor not found');

    const acceptedApp = await this.prisma.application.findFirst({
      where: {
        tutorId,
        studentId: student.studentProfile.id,
        status: 'ACCEPTED',
      },
    });
    if (!acceptedApp) {
      throw new ForbiddenException(
        'You can only review a tutor you have an accepted lesson with',
      );
    }

    try {
      return await this.prisma.review.create({
        data: {
          rating: dto.rating,
          comment: dto.comment,
          tutorId,
          studentId: student.studentProfile.id,
        },
        include: {
          tutor: true,
          student: { include: { user: { select: SAFE_USER_SELECT } } },
        },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('You have already reviewed this tutor');
      }
      throw error;
    }
  }

  async updateReview(email: string, reviewId: string, dto: UpdateReviewDto) {
    const review = await this.prisma.review.findUnique({
      where: { id: reviewId },
      include: { student: { include: { user: true } } },
    });
    if (!review) throw new NotFoundException('Review not found');
    if (review.student.user.email !== email) {
      throw new ForbiddenException('You can only update your own review');
    }

    return this.prisma.review.update({
      where: { id: reviewId },
      data: {
        rating: dto.rating ?? review.rating,
        comment: dto.comment ?? review.comment,
      },
    });
  }

  async deleteReview(email: string, reviewId: string) {
    const review = await this.prisma.review.findUnique({
      where: { id: reviewId },
      include: { student: { include: { user: true } } },
    });
    if (!review) throw new NotFoundException('Review not found');
    if (review.student.user.email !== email) {
      throw new ForbiddenException('You can only delete your own review');
    }

    return this.prisma.review.delete({ where: { id: reviewId } });
  }

  async getTutorReviews(tutorId: string, viewerEmail?: string) {
    const tutor = await this.prisma.tutorProfile.findUnique({
      where: { id: tutorId },
    });
    if (!tutor) throw new NotFoundException('Tutor not found');

    const reviews = await this.prisma.review.findMany({
      where: { tutorId },
      orderBy: { createdAt: 'desc' },
      include: {
        student: { include: { user: { select: SAFE_USER_SELECT } } },
      },
    });

    const total = reviews.length;
    const average =
      total === 0 ? 0 : reviews.reduce((s, r) => s + r.rating, 0) / total;

    const distribution: Record<1 | 2 | 3 | 4 | 5, number> = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
    };
    for (const r of reviews) {
      const k = r.rating as 1 | 2 | 3 | 4 | 5;
      if (k in distribution) distribution[k] += 1;
    }

    const viewerReviewed = viewerEmail
      ? reviews.some((r) => r.student.user.email === viewerEmail)
      : false;

    return {
      total,
      average,
      distribution,
      recent: reviews.slice(0, 10),
      viewerReviewed,
    };
  }

  async getTutorAverageRating(tutorEmail: string) {
    const user = await this.prisma.user.findUnique({
      where: { email: tutorEmail },
      include: { tutorProfile: true },
    });
    if (!user?.tutorProfile) {
      throw new NotFoundException('Tutor not found');
    }

    const result = await this.prisma.review.aggregate({
      where: { tutorId: user.tutorProfile.id },
      _avg: { rating: true },
    });

    return {
      tutorEmail,
      averageRating: result._avg.rating || 0,
    };
  }
}
