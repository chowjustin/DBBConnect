import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { promises as fs } from 'fs';
import * as path from 'path';
import type { Request } from 'express';
import { PrismaService } from '../prisma/prisma.service';

export type UploadKind = 'profile' | 'material' | 'verification';

const KIND_TO_FOLDER: Record<UploadKind, string> = {
  profile: 'profile',
  material: 'materials',
  verification: 'verification',
};

@Injectable()
export class UploadService {
  private uploadDir = path.join(process.cwd(), 'uploads');

  constructor(private prisma: PrismaService) {
    void this.ensureFolders();
  }

  private async ensureFolders() {
    for (const folder of Object.values(KIND_TO_FOLDER)) {
      await fs.mkdir(path.join(this.uploadDir, folder), { recursive: true });
    }
  }

  buildFileInfo(req: Request, kind: UploadKind, filename: string) {
    const folder = KIND_TO_FOLDER[kind];
    if (!folder) {
      throw new ForbiddenException(`Unknown upload kind: ${kind}`);
    }
    const relativePath = `${folder}/${filename}`;
    const proto =
      (req.headers['x-forwarded-proto'] as string | undefined)?.split(',')[0] ||
      req.protocol;
    const host = req.get('host');
    const file_url = `${proto}://${host}/uploads/${relativePath}`;
    return { kind, file_url, path: relativePath };
  }

  async saveProfilePicture(
    userId: string,
    file: Express.Multer.File,
    req: Request,
  ) {
    if (!file) throw new NotFoundException('No file provided');

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { tutorProfile: true, studentProfile: true },
    });

    if (!user) throw new NotFoundException('User not found');

    const info = this.buildFileInfo(req, 'profile', file.filename);

    let previousPath: string | null = null;

    if (user.role === UserRole.TUTOR && user.tutorProfile) {
      previousPath = user.tutorProfile.profileImage;
      await this.prisma.tutorProfile.update({
        where: { id: user.tutorProfile.id },
        data: { profileImage: info.path },
      });
    } else if (user.role === UserRole.STUDENT && user.studentProfile) {
      previousPath = user.studentProfile.profileImage;
      await this.prisma.studentProfile.update({
        where: { id: user.studentProfile.id },
        data: { profileImage: info.path },
      });
    } else {
      throw new ForbiddenException('User has no associated profile');
    }

    if (previousPath && previousPath !== info.path) {
      const absPrev = path.join(this.uploadDir, previousPath);
      try {
        await fs.unlink(absPrev);
      } catch {
        // Previous file may already be gone; ignore.
      }
    }

    return info;
  }

  async getMaterial(materialId: string, requesterId: string) {
    const material = await this.prisma.material.findUnique({
      where: { id: materialId },
      include: { tutor: { include: { students: true } } },
    });

    if (!material) throw new NotFoundException('Material not found');

    const user = await this.prisma.user.findUnique({
      where: { id: requesterId },
      include: { tutorProfile: true },
    });

    if (!user) throw new NotFoundException('User not found');

    const isTutorOwner =
      user.role === UserRole.TUTOR &&
      user.tutorProfile &&
      material.tutorId === user.tutorProfile.id;

    const isStudentAssigned =
      user.role === UserRole.STUDENT &&
      material.tutor.students.some((s) => s.userId === requesterId);

    if (!isTutorOwner && !isStudentAssigned) {
      throw new ForbiddenException('Access denied');
    }

    const absPath = path.isAbsolute(material.fileUrl)
      ? material.fileUrl
      : path.join(this.uploadDir, 'materials', path.basename(material.fileUrl));

    try {
      await fs.access(absPath);
    } catch {
      throw new NotFoundException('File not found on server');
    }

    return { ...material, absolutePath: absPath };
  }
}
