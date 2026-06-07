import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, Subject, VerificationStatus } from '@prisma/client';
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

  async search(
    name?: string,
    subject?: Subject,
    minRate?: number,
    maxRate?: number,
    excludeSelf?: boolean,
    email?: string,
  ) {
    const filters: Prisma.TutorProfileWhereInput[] = [];

    if (name) {
      filters.push({
        user: { name: { contains: name.trim(), mode: 'insensitive' } },
      });
    }

    if (subject) {
      filters.push({ subjects: { has: subject } });
    }

    if (minRate !== undefined || maxRate !== undefined) {
      const rateFilter: Prisma.FloatNullableFilter = {};
      if (minRate !== undefined) rateFilter.gte = minRate;
      if (maxRate !== undefined) rateFilter.lte = maxRate;
      filters.push({ hourlyRate: rateFilter });
    }

    if (excludeSelf && email) {
      filters.push({ user: { email: { not: email } } });
    }

    return this.prisma.tutorProfile.findMany({
      where: filters.length > 0 ? { AND: filters } : undefined,
      include: { user: true },
    });
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
