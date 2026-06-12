import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ApplicationStatus, Prisma } from '@prisma/client';
import { MailService } from '../mail/mail.service';
import { PaginationQueryDto } from '../common/dto/pagination.dto';
import { paginatePrisma } from '../common/paginate';

@Injectable()
export class ApplicationsService {
  private readonly logger = new Logger(ApplicationsService.name);

  constructor(
    private prisma: PrismaService,
    private mailService: MailService,
  ) {}


  async apply(studentEmail: string, tutorId: string, message?: string) {
    const student = await this.prisma.user.findUnique({
      where: { email: studentEmail },
      include: { studentProfile: true },
    });

    if (!student?.studentProfile) {
      throw new NotFoundException('Student profile not found');
    }

    const tutor = await this.prisma.tutorProfile.findUnique({
      where: { id: tutorId },
      include: { user: true },
    });

    if (!tutor) {
      throw new NotFoundException('Tutor not found');
    }

    const existing = await this.prisma.application.findFirst({
      where: {
        studentId: student.studentProfile.id,
        tutorId,
        status: {
          in: [ApplicationStatus.PENDING, ApplicationStatus.ACCEPTED],
        },
      },
    });

    if (existing) {
      throw new BadRequestException(
        existing.status === ApplicationStatus.ACCEPTED
          ? 'You already have an accepted lesson with this tutor'
          : 'You already applied and it is still pending',
      );
    }

    try {
      const newApp = await this.prisma.application.create({
        data: {
          studentId: student.studentProfile.id,
          tutorId,
          message: message ?? null,
        },
        include: {
          tutor: { include: { user: true } },
        },
      });

      this.mailService
        .sendStudentPendingEmail(student.email, tutor.user.name)
        .catch((err) =>
          this.logger.error('sendStudentPendingEmail failed', err),
        );
      this.mailService
        .sendTutorNewApplicationEmail(tutor.user.email, student.name)
        .catch((err) =>
          this.logger.error('sendTutorNewApplicationEmail failed', err),
        );

      return newApp;
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('You already applied to this tutor');
      }
      throw error;
    }
  }

  async cancel(studentEmail: string, applicationId: string) {
    const app = await this.prisma.application.findUnique({
      where: { id: applicationId },
      include: { student: { include: { user: true } } },
    });

    if (!app) {
      throw new NotFoundException('Application not found');
    }

    if (app.student.user.email !== studentEmail) {
      throw new ForbiddenException('You can only cancel your own applications');
    }

    if (app.status !== ApplicationStatus.PENDING) {
      throw new ForbiddenException('Only pending applications can be canceled');
    }

    return this.prisma.application.delete({ where: { id: applicationId } });
  }

  async listForStudent(studentEmail: string, pagination: PaginationQueryDto) {
    return paginatePrisma(this.prisma.application, pagination, {
      where: { student: { user: { email: studentEmail } } },
      include: { tutor: { include: { user: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async listForTutor(tutorEmail: string, pagination: PaginationQueryDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: tutorEmail },
      include: { tutorProfile: true },
    });

    if (!user?.tutorProfile) {
      throw new NotFoundException('Tutor profile not found');
    }

    return paginatePrisma(this.prisma.application, pagination, {
      where: { tutorId: user.tutorProfile.id },
      include: { student: { include: { user: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateStatus(
    tutorEmail: string,
    id: string,
    status: ApplicationStatus,
  ) {
    const app = await this.prisma.application.findUnique({
      where: { id },
      include: {
        tutor: { include: { user: true } },
        student: { include: { user: true } },
      },
    });

    if (!app) {
      throw new NotFoundException('Application not found');
    }

    if (app.tutor.user.email !== tutorEmail) {
      throw new ForbiddenException(
        'You can only update applications sent to you',
      );
    }

    if (app.status !== ApplicationStatus.PENDING) {
      throw new BadRequestException(
        'Only pending applications can be updated',
      );
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      const u = await tx.application.update({
        where: { id },
        data: { status },
      });

      if (status === ApplicationStatus.ACCEPTED) {
        await tx.tutorProfile.update({
          where: { id: app.tutor.id },
          data: {
            students: { connect: { id: app.student.id } },
          },
        });
      }

      return u;
    });

    this.mailService
      .sendStudentStatusUpdateEmail(
        app.student.user.email,
        status,
        app.tutor.user.name,
      )
      .catch((err) =>
        this.logger.error('sendStudentStatusUpdateEmail failed', err),
      );

    return updated;
  }
}
