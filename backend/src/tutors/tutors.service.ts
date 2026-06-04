import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateTutorDto } from './dto/update-tutor.dto';
import { MailService } from '../mail/mail.service';
import { Subject } from '@prisma/client';

@Injectable()
export class TutorsService {
  constructor(private prisma: PrismaService, private mailService: MailService) {}

  // search tutors by subject and optional rate range 
  async search(
    name?: string,
    subject?: Subject,
    minRate?: number,
    maxRate?: number,
    excludeSelf?: boolean,
    email?: string,
  ) {
    // Build filters dynamically, only include defined filters
    const filters: any[] = [];

    if (name) {
      filters.push({
        user: { name: { contains: name.trim(), mode: 'insensitive' } },
      });
    }

    if (subject) {
      filters.push({
        subjects: { has: subject }, 
      });
    }

    if (minRate !== undefined || maxRate !== undefined) {
      const rateFilter: any = {};
      if (minRate !== undefined) rateFilter.gte = minRate;
      if (maxRate !== undefined) rateFilter.lte = maxRate;
      filters.push({ hourlyRate: rateFilter });
    }

    if (excludeSelf && email) {
      filters.push({
        user: { email: { not: email } },
      });
    }

    const tutors = await this.prisma.tutorProfile.findMany({
      where: filters.length > 0 ? { AND: filters } : undefined,
      include: { user: true },
    });

    return tutors;
  }





  async getProfile(email: string) {
    const tutor = await this.prisma.user.findUnique({
      where: { email },
      include: {
        tutorProfile: {
          include: {
            students: true,
            applications: true,
          },
        },
      },
    });

    if (!tutor || !tutor.tutorProfile) {
      throw new NotFoundException("Tutor profile not found");
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


  // update tutor profile
  async update(id: string, dto: UpdateTutorDto) {
    const tutorExists = await this.prisma.tutorProfile.findUnique({ where: { id } });
    if (!tutorExists) throw new NotFoundException('Tutor profile not found');
    // console.log('DTO received:', dto);

    return this.prisma.tutorProfile.update({
      where: { id },
      data: {
        bio: dto.bio,
        hourlyRate: dto.hourlyRate,
        availability: dto.availability,
        subjects: dto.subjects,
      },
    });
  }

  // list all students the tutor currently teaches
  async listAllStudents(tutorEmail: string) {
    // Find the tutor with their connected students
    const tutorUser = await this.prisma.user.findUnique({
      where: { email: tutorEmail },
      include: {
        tutorProfile: {
          include: {
            students: {
              include: {
                user: true, 
              },
            },
          },
        },
      },
    });

    if (!tutorUser || !tutorUser.tutorProfile) {
      throw new NotFoundException('Tutor profile not found');
    }

    // Map only the connected student info
    return tutorUser.tutorProfile.students.map(student => ({
      id: student.id,
      name: student.user.name,
      email: student.user.email,
      phoneNumber: student.user.phoneNumber,
      role: student.user.role,
    }));
  }

  async removeStudent(tutorEmail: string, studentId: string) {
  // Find tutor and their profile
  const tutorUser = await this.prisma.user.findUnique({
    where: { email: tutorEmail },
    include: { tutorProfile: { include: { students: true } } },
  });

  if (!tutorUser?.tutorProfile) {
    throw new NotFoundException('Tutor profile not found');
  }

  const tutorProfileId = tutorUser.tutorProfile.id;

  // Check if the student is actually assigned to this tutor
  const isStudentAssigned = tutorUser.tutorProfile.students.some(
    s => s.id === studentId,
  );

  if (!isStudentAssigned) {
    throw new ForbiddenException(
      'This student is not assigned to you or already removed',
    );
  }

  // 1. Disconnect the student from tutor
  await this.prisma.tutorProfile.update({
    where: { id: tutorProfileId },
    data: {
      students: { disconnect: { id: studentId } },
    },
  });

  // 2. Delete all applications between this tutor & student
  await this.prisma.application.deleteMany({
    where: {
      studentId,
      tutorId: tutorProfileId,
    },
  });

  return { message: 'Student removed successfully and applications cleared' };
}



  // list all applications for this tutor (students who applied)
  async listApplications(tutorEmail: string) {
    const tutorUser = await this.prisma.user.findUnique({
      where: { email: tutorEmail },
      include: { tutorProfile: true },
    });

    if (!tutorUser || !tutorUser.tutorProfile) {
      throw new NotFoundException('Tutor profile not found');
    }

    const tutorId = tutorUser.tutorProfile.id;

    const applications = await this.prisma.application.findMany({
      where: { tutorId },
      include: {
        student: {
          include: {
            user: true,
          },
        },
      },
    });

    // Return both student info and application status
    return applications.map(app => ({
      studentId: app.student.id,
      name: app.student.user.name,
      email: app.student.user.email,
      phoneNumber: app.student.user.phoneNumber,
      role: app.student.user.role,
      applicationStatus: app.status,
      requestedAt: app.requestedAt,
      scheduledAt: app.scheduledAt,
    }));
  }

  async acceptApplication(tutorEmail: string, applicationId: string) {
  // Find the tutor
  const tutorUser = await this.prisma.user.findUnique({
    where: { email: tutorEmail },
    include: { tutorProfile: true },
  });

  if (!tutorUser?.tutorProfile) {
    throw new NotFoundException('Tutor profile not found');
  }

  // Find the application
  const application = await this.prisma.application.findUnique({
    where: { id: applicationId },
    include: { student: true },
  });

  if (!application) throw new NotFoundException('Application not found');
  if (application.tutorId !== tutorUser.tutorProfile.id) {
    throw new ForbiddenException('You can only manage your own applications');
  }

  // Update application status to ACCEPTED
  await this.prisma.application.update({
    where: { id: applicationId },
    data: { status: 'ACCEPTED' },
  });

  // Add student to tutor's students relation
  await this.prisma.tutorProfile.update({
    where: { id: tutorUser.tutorProfile.id },
    data: {
      students: { connect: { id: application.studentId } },
    },
  });

  return { message: 'Application accepted successfully' };
}

  async rejectApplication(tutorEmail: string, applicationId: string) {
    const tutorUser = await this.prisma.user.findUnique({
      where: { email: tutorEmail },
      include: { tutorProfile: true },
    });

    if (!tutorUser?.tutorProfile) {
      throw new NotFoundException('Tutor profile not found');
    }

    const application = await this.prisma.application.findUnique({
      where: { id: applicationId },
    });

    if (!application) throw new NotFoundException('Application not found');
    if (application.tutorId !== tutorUser.tutorProfile.id) {
      throw new ForbiddenException('You can only manage your own applications');
    }

    await this.prisma.application.update({
      where: { id: applicationId },
      data: { status: 'REJECTED' },
    });

    return { message: 'Application rejected successfully' };
  }

}
