import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MaterialsService {
  constructor(private prisma: PrismaService) {}

  async userOwnsTutorProfile(userId: string, tutorProfileId: string) {
    const tp = await this.prisma.tutorProfile.findUnique({
      where: { id: tutorProfileId },
      select: { userId: true },
    });
    return !!tp && tp.userId === userId;
  }

  async userOwnsStudentProfile(userId: string, studentProfileId: string) {
    const sp = await this.prisma.studentProfile.findUnique({
      where: { id: studentProfileId },
      select: { userId: true },
    });
    return !!sp && sp.userId === userId;
  }

  async uploadMaterial(
    file: Express.Multer.File,
    tutorUserId: string,
    studentProfileIds: string[],
  ) {
    if (!file) throw new BadRequestException('File is missing');

    const tutor = await this.prisma.tutorProfile.findUnique({
      where: { userId: tutorUserId },
      select: { id: true, students: { select: { id: true } } },
    });
    if (!tutor) throw new ForbiddenException('Tutor profile not found');

    if (studentProfileIds.length) {
      const ownIds = new Set(tutor.students.map((s) => s.id));
      const stranger = studentProfileIds.find((id) => !ownIds.has(id));
      if (stranger) {
        throw new ForbiddenException(
          `Student ${stranger} is not assigned to this tutor`,
        );
      }
    }

    const material = await this.prisma.material.create({
      data: {
        title: file.originalname,
        fileUrl: `materials/${file.filename}`,
        tutorId: tutor.id,
      },
    });

    if (studentProfileIds.length) {
      await this.prisma.materialAccess.createMany({
        data: studentProfileIds.map((sid) => ({
          materialId: material.id,
          studentId: sid,
        })),
        skipDuplicates: true,
      });
    }

    return {
      success: true,
      message: 'Material uploaded',
      materialId: material.id,
    };
  }

  async getMaterialsForTutor(tutorProfileId: string) {
    return this.prisma.material.findMany({
      where: { tutorId: tutorProfileId },
      include: {
        allowedStudents: {
          include: {
            student: { include: { user: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getMaterialsForStudent(studentProfileId: string) {
    return this.prisma.material.findMany({
      where: {
        allowedStudents: { some: { studentId: studentProfileId } },
      },
      include: {
        tutor: { include: { user: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
