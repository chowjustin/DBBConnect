import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ApplicationStatus } from '@prisma/client';
import { MailService } from '../mail/mail.service';

@Injectable()
export class ApplicationsService {
  constructor(private prisma: PrismaService, private mailService: MailService,) {}
  // student applies to tutor
  async apply(studentEmail: string, tutorId: string) {
    const student = await this.prisma.user.findUnique({
      where: { email: studentEmail },
      include: { studentProfile: true },
    });

    if (!student?.studentProfile) {
      throw new NotFoundException('Student profile not found');
    }

    const tutor = await this.prisma.tutorProfile.findUnique({
      where: { id: tutorId },
      include: { user: true }, // added so we can access tutor.user.email & name
    });

    if (!tutor) {
      throw new NotFoundException('Tutor not found');
    }

    const existing = await this.prisma.application.findFirst({
      where: {
        studentId: student.studentProfile.id,
        tutorId,
        status: ApplicationStatus.PENDING,
      },
    });

    if (existing) {
      throw new BadRequestException('You already applied and it is still pending');
    }

    const newApp = await this.prisma.application.create({
      data: {
        studentId: student.studentProfile.id,
        tutorId,
      },
      include: {
        tutor: { include: { user: true } },
      },
    });

    await this.mailService.sendStudentPendingEmail(
      student.email,
      tutor.user.name,
    );

    await this.mailService.sendTutorNewApplicationEmail(
      tutor.user.email,
      student.name,
    );

    return newApp;
  }


  // student cancels only if still pending
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

  // student sees their own applications
  async listForStudent(studentEmail: string) {
    return this.prisma.application.findMany({
      where: {
        student: {
          user: { email: studentEmail },
        },
      },
      include: { tutor: { include: { user: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  // tutor sees all applications sent to them
  async listForTutor(tutorEmail: string) {
  // Step 1: Get the User by email
  const user = await this.prisma.user.findUnique({
    where: { email: tutorEmail },
  });

  if (!user) return [];

  // Step 2: Get tutor profile with that user ID
  const tutor = await this.prisma.tutorProfile.findUnique({
    where: { userId: user.id },
  });

  if (!tutor) return [];

  // Step 3: Get ALL applications for that tutor — NO status filter
  return this.prisma.application.findMany({
    where: {
      tutorId: tutor.id,
    },
    include: {
      student: {
        include: {
          user: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}


  // tutor updates status (accept or reject)
  async updateStatus(tutorEmail: string, id: string, status: ApplicationStatus) {
    const app = await this.prisma.application.findUnique({
      where: { id },
      include: {
        tutor: { include: { user: true, students: true } }, // include students
        student: { include: { user: true } },
      },
    });

    if (!app) {
      throw new NotFoundException('Application not found');
    }

    if (app.tutor.user.email !== tutorEmail) {
      throw new ForbiddenException('You can only update applications sent to you');
    }

    if (app.status !== ApplicationStatus.PENDING) {
      throw new BadRequestException('Only pending applications can be updated');
    }

    // Update the application status
    const updated = await this.prisma.application.update({
      where: { id },
      data: { status },
    });

    // If accepted, add the student to the tutor's students relation
    if (status === ApplicationStatus.ACCEPTED) {
      await this.prisma.tutorProfile.update({
        where: { id: app.tutor.id },
        data: {
          students: {
            connect: { id: app.student.id },
          },
        },
      });
    }

    await this.mailService.sendStudentStatusUpdateEmail(
      app.student.user.email,
      status,
      app.tutor.user.name,
    );

    return updated;
  }


}
