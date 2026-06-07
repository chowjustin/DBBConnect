import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  EducationLevel,
  Prisma,
  Subject,
  TeachingMethod,
  VerificationStatus,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { UpdateTutorDto } from './dto/update-tutor.dto';

const COMPLETENESS_WEIGHTS = {
  bio: 10,
  educationBackground: 10,
  teachingMethods: 10,
  educationLevels: 5,
  subjects: 10,
  hourlyRate: 10,
  introVideoUrl: 10,
  whatsappNumber: 5,
  bank: 10,
  availability: 10,
  verified: 10,
};
const PUBLISH_MIN_SCORE = 80;

@Injectable()
export class TutorsService {
  constructor(
    private prisma: PrismaService,
    private mailService: MailService,
  ) {}

  computeCompleteness(
    tutor: any,
    hasAvailability: boolean,
  ): { score: number; missing: string[] } {
    const w = COMPLETENESS_WEIGHTS;
    let score = 0;
    const missing: string[] = [];

    const add = (cond: boolean, weight: number, field: string) => {
      if (cond) score += weight;
      else missing.push(field);
    };

    add(!!tutor.bio, w.bio, 'bio');
    add(!!tutor.educationBackground, w.educationBackground, 'educationBackground');
    add(
      Array.isArray(tutor.teachingMethods) && tutor.teachingMethods.length > 0,
      w.teachingMethods,
      'teachingMethods',
    );
    add(
      Array.isArray(tutor.educationLevels) && tutor.educationLevels.length > 0,
      w.educationLevels,
      'educationLevels',
    );
    add(
      Array.isArray(tutor.subjects) && tutor.subjects.length > 0,
      w.subjects,
      'subjects',
    );
    add(!!tutor.hourlyRate && tutor.hourlyRate > 0, w.hourlyRate, 'hourlyRate');
    add(!!tutor.introVideoUrl, w.introVideoUrl, 'introVideoUrl');
    add(!!tutor.whatsappNumber, w.whatsappNumber, 'whatsappNumber');
    add(
      !!tutor.bankName && !!tutor.bankAccountNumber && !!tutor.bankAccountHolder,
      w.bank,
      'bank',
    );
    add(hasAvailability, w.availability, 'availability');
    add(tutor.verificationStatus === VerificationStatus.VERIFIED, w.verified, 'verification');

    return { score, missing };
  }

  async getCompleteness(email: string) {
    const tutorUser = await this.prisma.user.findUnique({
      where: { email },
      include: { tutorProfile: true },
    });
    if (!tutorUser?.tutorProfile) {
      throw new NotFoundException('Tutor profile not found');
    }
    // availability count via legacy json or future AvailabilitySlot
    const slotCount = await this.prisma.availabilitySlot.count({
      where: { tutorId: tutorUser.tutorProfile.id },
    });
    const hasAvailability = slotCount > 0;
    const { score, missing } = this.computeCompleteness(
      tutorUser.tutorProfile,
      hasAvailability,
    );
    return { score, missing, minRequired: PUBLISH_MIN_SCORE };
  }

  async publish(email: string) {
    const tutorUser = await this.prisma.user.findUnique({
      where: { email },
      include: { tutorProfile: true },
    });
    if (!tutorUser?.tutorProfile) {
      throw new NotFoundException('Tutor profile not found');
    }
    if (tutorUser.tutorProfile.verificationStatus !== VerificationStatus.VERIFIED) {
      throw new ForbiddenException('Verify your account before publishing');
    }
    const slotCount = await this.prisma.availabilitySlot.count({
      where: { tutorId: tutorUser.tutorProfile.id },
    });
    const hasAvailability = slotCount > 0;
    const { score, missing } = this.computeCompleteness(
      tutorUser.tutorProfile,
      hasAvailability,
    );
    if (score < PUBLISH_MIN_SCORE) {
      throw new BadRequestException({
        message: `Profile completeness ${score}% below required ${PUBLISH_MIN_SCORE}%`,
        missing,
      });
    }
    return this.prisma.tutorProfile.update({
      where: { id: tutorUser.tutorProfile.id },
      data: { publishedAt: new Date() },
    });
  }

  async unpublish(email: string) {
    const tutorUser = await this.prisma.user.findUnique({
      where: { email },
      include: { tutorProfile: true },
    });
    if (!tutorUser?.tutorProfile) {
      throw new NotFoundException('Tutor profile not found');
    }
    return this.prisma.tutorProfile.update({
      where: { id: tutorUser.tutorProfile.id },
      data: { publishedAt: null },
    });
  }

  async submitVerification(
    email: string,
    idDocumentUrl: string,
    educationProofUrl: string,
  ) {
    const tutorUser = await this.prisma.user.findUnique({
      where: { email },
      include: { tutorProfile: true },
    });
    if (!tutorUser?.tutorProfile) {
      throw new NotFoundException('Tutor profile not found');
    }
    return this.prisma.tutorProfile.update({
      where: { id: tutorUser.tutorProfile.id },
      data: {
        idDocumentUrl,
        educationProofUrl,
        verificationStatus: VerificationStatus.PENDING,
        verificationNotes: null,
      },
    });
  }

  async listPendingVerification() {
    return this.prisma.tutorProfile.findMany({
      where: { verificationStatus: VerificationStatus.PENDING },
      include: { user: { select: { id: true, name: true, email: true } } },
      orderBy: { updatedAt: 'asc' },
    });
  }

  async reviewVerification(
    tutorProfileId: string,
    status: VerificationStatus,
    notes?: string,
  ) {
    const tutor = await this.prisma.tutorProfile.findUnique({
      where: { id: tutorProfileId },
      include: { user: true },
    });
    if (!tutor) throw new NotFoundException('Tutor profile not found');
    if (status === VerificationStatus.PENDING) {
      throw new BadRequestException('Cannot set status back to PENDING');
    }
    const updated = await this.prisma.tutorProfile.update({
      where: { id: tutorProfileId },
      data: {
        verificationStatus: status,
        verificationNotes: notes,
        verifiedAt: status === VerificationStatus.VERIFIED ? new Date() : null,
      },
    });
    this.mailService
      .sendEmail(
        tutor.user.email,
        `Tutor verification ${status}`,
        `Your verification was ${status}. ${notes ?? ''}`,
      )
      .catch((e) => console.error('verification mail failed', e));
    return updated;
  }

  async search(opts: {
    name?: string;
    subject?: Subject;
    minRate?: number;
    maxRate?: number;
    minRating?: number;
    educationLevel?: EducationLevel;
    methods?: TeachingMethod[];
    sortBy?: 'rating' | 'priceAsc' | 'priceDesc' | 'featured';
    excludeSelf?: boolean;
    email?: string;
  }) {
    const filters: Prisma.TutorProfileWhereInput[] = [
      { publishedAt: { not: null } },
      { verificationStatus: VerificationStatus.VERIFIED },
    ];

    if (opts.name) {
      filters.push({
        user: { name: { contains: opts.name.trim(), mode: 'insensitive' } },
      });
    }
    if (opts.subject) filters.push({ subjects: { has: opts.subject } });
    if (opts.educationLevel)
      filters.push({ educationLevels: { has: opts.educationLevel } });
    if (opts.methods && opts.methods.length > 0) {
      filters.push({ teachingMethods: { hasSome: opts.methods } });
    }
    if (opts.minRate !== undefined || opts.maxRate !== undefined) {
      const rateFilter: Prisma.FloatNullableFilter = {};
      if (opts.minRate !== undefined) rateFilter.gte = opts.minRate;
      if (opts.maxRate !== undefined) rateFilter.lte = opts.maxRate;
      filters.push({ hourlyRate: rateFilter });
    }
    if (opts.excludeSelf && opts.email) {
      filters.push({ user: { email: { not: opts.email } } });
    }

    const tutors = await this.prisma.tutorProfile.findMany({
      where: { AND: filters },
      include: { user: true, featuredListing: true },
    });

    // attach average rating
    const ratings = await this.prisma.review.groupBy({
      by: ['tutorId'],
      where: { tutorId: { in: tutors.map((t) => t.id) } },
      _avg: { rating: true },
      _count: { rating: true },
    });
    const rMap = new Map(
      ratings.map((r) => [
        r.tutorId,
        { avg: r._avg.rating ?? 0, count: r._count.rating },
      ]),
    );

    let enriched = tutors.map((t) => ({
      ...t,
      averageRating: rMap.get(t.id)?.avg ?? 0,
      reviewCount: rMap.get(t.id)?.count ?? 0,
      featured:
        !!t.featuredListing && t.featuredListing.activeUntil > new Date(),
    }));

    if (opts.minRating !== undefined) {
      enriched = enriched.filter((t) => t.averageRating >= opts.minRating!);
    }

    // sort
    const sortBy = opts.sortBy ?? 'featured';
    if (sortBy === 'rating') {
      enriched.sort((a, b) => b.averageRating - a.averageRating);
    } else if (sortBy === 'priceAsc') {
      enriched.sort((a, b) => (a.hourlyRate ?? 0) - (b.hourlyRate ?? 0));
    } else if (sortBy === 'priceDesc') {
      enriched.sort((a, b) => (b.hourlyRate ?? 0) - (a.hourlyRate ?? 0));
    } else {
      // featured first, then rating
      enriched.sort((a, b) => {
        if (a.featured !== b.featured) return a.featured ? -1 : 1;
        return b.averageRating - a.averageRating;
      });
    }

    return enriched;
  }

  async rateSuggestion(opts: {
    subject?: Subject;
    educationLevel?: EducationLevel;
    experience?: number;
  }) {
    const where: Prisma.TutorProfileWhereInput = {
      publishedAt: { not: null },
      verificationStatus: VerificationStatus.VERIFIED,
      hourlyRate: { not: null, gt: 0 },
    };
    if (opts.subject) where.subjects = { has: opts.subject };
    if (opts.educationLevel) where.educationLevels = { has: opts.educationLevel };
    if (opts.experience !== undefined) {
      const bucket = Math.floor(opts.experience / 2) * 2;
      where.experience = { gte: bucket, lt: bucket + 2 };
    }
    let tutors = await this.prisma.tutorProfile.findMany({
      where,
      select: { hourlyRate: true },
    });
    if (tutors.length < 5 && opts.subject) {
      // fallback subject-only
      tutors = await this.prisma.tutorProfile.findMany({
        where: {
          publishedAt: { not: null },
          verificationStatus: VerificationStatus.VERIFIED,
          hourlyRate: { not: null, gt: 0 },
          subjects: { has: opts.subject },
        },
        select: { hourlyRate: true },
      });
    }
    const rates = tutors
      .map((t) => t.hourlyRate ?? 0)
      .filter((r) => r > 0)
      .sort((a, b) => a - b);
    if (rates.length === 0) return { p25: 0, p50: 0, p75: 0, sampleSize: 0 };
    const pick = (p: number) => rates[Math.floor((rates.length - 1) * p)];
    return {
      p25: pick(0.25),
      p50: pick(0.5),
      p75: pick(0.75),
      sampleSize: rates.length,
    };
  }

  async collections() {
    const all = await this.prisma.tutorProfile.findMany({
      where: {
        publishedAt: { not: null },
        verificationStatus: VerificationStatus.VERIFIED,
      },
      include: { user: true },
    });
    const ratings = await this.prisma.review.groupBy({
      by: ['tutorId'],
      where: { tutorId: { in: all.map((t) => t.id) } },
      _avg: { rating: true },
      _count: { rating: true },
    });
    const rMap = new Map(
      ratings.map((r) => [
        r.tutorId,
        { avg: r._avg.rating ?? 0, count: r._count.rating },
      ]),
    );
    const since30 = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const since14 = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
    const sessions = await this.prisma.session.groupBy({
      by: ['tutorId'],
      where: { status: 'COMPLETED', endsAt: { gt: since30 } },
      _count: { id: true },
    });
    const sMap = new Map(sessions.map((s) => [s.tutorId, s._count.id]));

    const enriched = all.map((t) => ({
      ...t,
      averageRating: rMap.get(t.id)?.avg ?? 0,
      reviewCount: rMap.get(t.id)?.count ?? 0,
      recentSessions: sMap.get(t.id) ?? 0,
    }));

    return {
      topRated: enriched
        .filter((t) => t.reviewCount >= 5)
        .sort((a, b) => b.averageRating - a.averageRating)
        .slice(0, 10),
      mostActive: enriched
        .sort((a, b) => b.recentSessions - a.recentSessions)
        .slice(0, 10),
      newTutors: enriched
        .filter((t) => t.publishedAt! > since14)
        .slice(0, 10),
    };
  }

  async getProfile(email: string) {
    const tutor = await this.prisma.user.findUnique({
      where: { email },
      include: {
        tutorProfile: {
          include: { students: true, applications: true },
        },
      },
    });

    if (!tutor || !tutor.tutorProfile) {
      throw new NotFoundException('Tutor profile not found');
    }

    return {
      user: {
        id: tutor.id,
        name: tutor.name,
        email: tutor.email,
        phoneNumber: tutor.phoneNumber,
        role: tutor.role,
      },
      profile: tutor.tutorProfile,
    };
  }

  async update(id: string, dto: UpdateTutorDto) {
    const exists = await this.prisma.tutorProfile.findUnique({ where: { id } });
    if (!exists) throw new NotFoundException('Tutor profile not found');

    return this.prisma.tutorProfile.update({
      where: { id },
      data: {
        bio: dto.bio,
        hourlyRate: dto.hourlyRate,
        subjects: dto.subjects,
        whatsappNumber: dto.whatsappNumber,
        educationBackground: dto.educationBackground,
        educationLevels: dto.educationLevels,
        teachingMethods: dto.teachingMethods,
        introVideoUrl: dto.introVideoUrl,
        bankName: dto.bankName,
        bankAccountNumber: dto.bankAccountNumber,
        bankAccountHolder: dto.bankAccountHolder,
      },
    });
  }

  async listAllStudents(tutorEmail: string) {
    const tutorUser = await this.prisma.user.findUnique({
      where: { email: tutorEmail },
      include: {
        tutorProfile: {
          include: { students: { include: { user: true } } },
        },
      },
    });

    if (!tutorUser || !tutorUser.tutorProfile) {
      throw new NotFoundException('Tutor profile not found');
    }

    return tutorUser.tutorProfile.students.map((student) => ({
      id: student.id,
      name: student.user.name,
      email: student.user.email,
      phoneNumber: student.user.phoneNumber,
      role: student.user.role,
    }));
  }

  async removeStudent(tutorEmail: string, studentId: string) {
    const tutorUser = await this.prisma.user.findUnique({
      where: { email: tutorEmail },
      include: { tutorProfile: { include: { students: true } } },
    });

    if (!tutorUser?.tutorProfile) {
      throw new NotFoundException('Tutor profile not found');
    }

    const tutorProfileId = tutorUser.tutorProfile.id;

    const isAssigned = tutorUser.tutorProfile.students.some(
      (s) => s.id === studentId,
    );
    if (!isAssigned) {
      throw new ForbiddenException(
        'This student is not assigned to you or already removed',
      );
    }

    await this.prisma.tutorProfile.update({
      where: { id: tutorProfileId },
      data: { students: { disconnect: { id: studentId } } },
    });

    return { message: 'Student removed successfully' };
  }

  async listApplications(tutorEmail: string) {
    const tutorUser = await this.prisma.user.findUnique({
      where: { email: tutorEmail },
      include: { tutorProfile: true },
    });

    if (!tutorUser || !tutorUser.tutorProfile) {
      throw new NotFoundException('Tutor profile not found');
    }

    const applications = await this.prisma.application.findMany({
      where: { tutorId: tutorUser.tutorProfile.id },
      include: { student: { include: { user: true } } },
    });

    return applications.map((app) => ({
      studentId: app.student.id,
      name: app.student.user.name,
      email: app.student.user.email,
      phoneNumber: app.student.user.phoneNumber,
      role: app.student.user.role,
      applicationStatus: app.status,
      requestedAt: app.requestedAt,
    }));
  }
}
