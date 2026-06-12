import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { EducationLevel, MaterialKind, Subject } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { PaginationQueryDto } from '../common/dto/pagination.dto';
import { paginatePrisma } from '../common/paginate';

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

  async createMaterial(
    fileUrl: string,
    originalName: string,
    tutorUserId: string,
    studentProfileIds: string[],
    meta?: {
      subject?: Subject;
      level?: EducationLevel;
      kind?: MaterialKind;
      description?: string;
    },
  ) {
    if (!fileUrl) throw new BadRequestException('fileUrl is required');
    if (!originalName) throw new BadRequestException('originalName is required');

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
        title: originalName,
        fileUrl,
        tutorId: tutor.id,
        ...(meta?.subject ? { subject: meta.subject } : {}),
        ...(meta?.level ? { level: meta.level } : {}),
        ...(meta?.kind ? { kind: meta.kind } : {}),
        ...(meta?.description ? { description: meta.description } : {}),
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

  async getMaterialsForTutor(
    tutorProfileId: string,
    pagination: PaginationQueryDto,
    filters?: {
      subject?: Subject;
      level?: EducationLevel;
      kind?: MaterialKind;
    },
  ) {
    return paginatePrisma(this.prisma.material, pagination, {
      where: {
        tutorId: tutorProfileId,
        subject: filters?.subject,
        level: filters?.level,
        kind: filters?.kind,
      },
      include: {
        allowedStudents: {
          include: { student: { include: { user: true } } },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getMaterialsForStudent(
    studentProfileId: string,
    pagination: PaginationQueryDto,
    filters?: {
      subject?: Subject;
      level?: EducationLevel;
      kind?: MaterialKind;
    },
  ) {
    return paginatePrisma(this.prisma.material, pagination, {
      where: {
        allowedStudents: { some: { studentId: studentProfileId } },
        subject: filters?.subject,
        level: filters?.level,
        kind: filters?.kind,
      },
      include: { tutor: { include: { user: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }
}
