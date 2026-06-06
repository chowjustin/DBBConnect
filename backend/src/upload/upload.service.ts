import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaClient, UserRole } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

@Injectable()
export class UploadService {
  private uploadDir = path.join(process.cwd(), 'uploads');

  constructor() {
    // Ensure upload folders exist
    const folders = ['profile', 'materials'];
    folders.forEach((f) => {
      const folderPath = path.join(this.uploadDir, f);
      if (!fs.existsSync(folderPath))
        fs.mkdirSync(folderPath, { recursive: true });
    });
  }

  // ----------------------------
  // PROFILE PICTURE
  // ----------------------------
  async saveProfilePicture(userId: string, file: Express.Multer.File) {
    if (!file) throw new NotFoundException('No file provided');

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { tutorProfile: true, studentProfile: true },
    });

    if (!user) throw new NotFoundException('User not found');

    // Multer (diskStorage) already saved the file
    const publicPath = `http://localhost:${process.env.PORT || 8000}/uploads/profile/${file.filename}`;

    if (user.role === UserRole.TUTOR && user.tutorProfile) {
      return prisma.tutorProfile.update({
        where: { id: user.tutorProfile.id },
        data: { profileImage: publicPath },
      });
    } else if (user.role === UserRole.STUDENT && user.studentProfile) {
      return prisma.studentProfile.update({
        where: { id: user.studentProfile.id },
        data: { profileImage: publicPath },
      });
    } else {
      throw new ForbiddenException('User has no associated profile');
    }
  }

  // ----------------------------
  // TUTOR MATERIAL
  // ----------------------------
  async saveMaterial(userId: string, file: Express.Multer.File) {
    if (!file) throw new NotFoundException('No file provided');

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { tutorProfile: true },
    });

    if (!user || !user.tutorProfile)
      throw new ForbiddenException('Tutor not found');

    const filePath = path.join(this.uploadDir, 'materials', file.originalname);
    fs.writeFileSync(filePath, file.buffer);

    return prisma.material.create({
      data: {
        title: file.originalname,
        fileUrl: filePath,
        tutorId: user.tutorProfile.id,
      },
    });
  }

  // ----------------------------
  // GET MATERIAL (for students)
  // ----------------------------
  async getMaterial(materialId: string, requesterId: string) {
    const material = await prisma.material.findUnique({
      where: { id: materialId },
      include: { tutor: { include: { students: true } } },
    });

    if (!material) throw new NotFoundException('Material not found');

    // Fetch requester with tutorProfile
    const user = await prisma.user.findUnique({
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

    if (!isTutorOwner && !isStudentAssigned)
      throw new ForbiddenException('Access denied');

    if (!fs.existsSync(material.fileUrl))
      throw new NotFoundException('File not found on server');

    return material;
  }
}
