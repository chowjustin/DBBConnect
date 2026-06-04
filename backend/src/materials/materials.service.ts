import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class MaterialsService {
  constructor(private prisma: PrismaService) {}

  async uploadMaterial(
    file: Express.Multer.File,
    tutorProfileId: string,
    studentProfileIds: string[]
  ) {
    if (!file) throw new Error("File is missing");

    // 1. Create Material
    const material = await this.prisma.material.create({
      data: {
        title: file.originalname,
        fileUrl: file.filename,
        tutorId: tutorProfileId,
      },
    });

    // 2. Assign student access
    await this.prisma.materialAccess.createMany({
      data: studentProfileIds.map((sid) => ({
        materialId: material.id,
        studentId: sid,
      })),
    });

    return {
      success: true,
      message: "Material uploaded",
      materialId: material.id,
    };
  }

  async getMaterialsForTutor(tutorProfileId: string) {
  return this.prisma.material.findMany({
    where: { tutorId: tutorProfileId },
    include: {
      allowedStudents: {
        include: {
          student: {
            include: {
              user: true, // include the related user object
            },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}


  async getMaterialsForStudent(studentProfileId: string) {
  return this.prisma.material.findMany({
    where: {
      allowedStudents: {
        some: { studentId: studentProfileId },
      },
    },
    include: {
      tutor: {
        include: {
          user: true, // Include tutor's user details such as name
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

}
