import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';
import type { Request } from 'express';
import { PrismaService } from '../prisma/prisma.service';
import { S3Service } from '../s3/s3.service';
import { objectKey } from './multer.config';

export type UploadKind =
  | 'profile'
  | 'material'
  | 'verification'
  | 'payment'
  | 'payout';

const KIND_TO_FOLDER: Record<UploadKind, string> = {
  profile: 'profile',
  material: 'materials',
  verification: 'verification',
  payment: 'payments',
  payout: 'payouts',
};

@Injectable()
export class UploadService {
  constructor(
    private prisma: PrismaService,
    private s3: S3Service,
  ) {}

  /**
   * Build the public response shape for an uploaded asset. `key` is the bare
   * object key (e.g. `profile/<uuid>.jpg`). `file_url` is absolute so clients
   * can use it directly; `path` is the bare key persisted in the DB.
   */
  buildFileInfo(req: Request, kind: UploadKind, key: string) {
    const folder = KIND_TO_FOLDER[kind];
    if (!folder) {
      throw new ForbiddenException(`Unknown upload kind: ${kind}`);
    }
    const proto =
      (req.headers['x-forwarded-proto'] as string | undefined)?.split(',')[0] ||
      req.protocol;
    const host = req.get('host');
    const file_url = `${proto}://${host}/uploads/${key}`;
    return { kind, file_url, path: key };
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

    const key = objectKey('profile', file.originalname);
    await this.s3.putObject(key, file.buffer, file.mimetype);
    const info = this.buildFileInfo(req, 'profile', key);

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
      await this.s3.deleteObject(previousPath);
    }

    return info;
  }

  /**
   * Authorize access to a material and return it. The object key lives in
   * `fileUrl`; the controller streams the bytes from object storage.
   */
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

    return material;
  }
}
