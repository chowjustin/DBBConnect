import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateStudentDto } from './dto/update-student.dto';
import { BadRequestException } from '@nestjs/common';
import { Subject } from '@prisma/client';

@Injectable()
export class StudentsService {
  constructor(private prisma: PrismaService) {}

  async getProfile(email: string) {
  const student = await this.prisma.user.findUnique({
  where: { email },
  include: {
    studentProfile: {
      include: {
        tutors: {
          include: {
            user: true, 
          },
        },
        applications: true,
      },
    },
  },
});


  if (!student || !student.studentProfile) {
    throw new NotFoundException("Student profile not found");
  }

  return {
    user: {
      id: student.id,
      name: student.name,
      email: student.email,
      phoneNumber: student.phoneNumber,
      role: student.role,
    },
    profile: student.studentProfile
  };
}

  async search(
  name?: string,
  subject?: Subject,
  minRate?: number,
  maxRate?: number,
  excludeSelf?: boolean,
  email?: string,
) {
  const filters: any[] = [];

  if (name) {
    filters.push({
      user: { name: { contains: name.trim(), mode: 'insensitive' } },
    });
  }

  if (subject) {
    filters.push({ subjects: { has: subject } });
  }

  if (minRate !== undefined || maxRate !== undefined) {
    const rateFilter: any = {};
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


    async update(id: string, dto: UpdateStudentDto) {
    // Check if the student profile exists
    const studentExists = await this.prisma.studentProfile.findUnique({
      where: { id },
    });

    if (!studentExists) {
      throw new NotFoundException('Student profile not found');
    }

    // Update student profile
    return this.prisma.studentProfile.update({
      where: { id },
      data: {
        bio: dto.bio,
        school: dto.school,
        interests: dto.interests,
      },
      include: {
        user: true,
      },
    });
  }
}
