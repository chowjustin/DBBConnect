import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  UploadedFile,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { diskStorage } from "multer";
import { extname } from "path";
import { MaterialsService } from "./materials.service";

@Controller("materials")
export class MaterialsController {
  constructor(private readonly materialsService: MaterialsService) {}

  @Post("upload/:tutorProfileId")
@UseInterceptors(
  FileInterceptor("file", {
    storage: diskStorage({
      destination: "./uploads/materials",
      filename: (req, file, cb) => {
        const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, unique + extname(file.originalname));
      },
    }),
  })
)
async uploadMaterial(
  @UploadedFile() file: Express.Multer.File,
  @Param("tutorProfileId") tutorProfileId: string,
  @Body("allowedStudents") allowedStudents: string | string[]
) {
  // Normalize to array
  const studentsArray = Array.isArray(allowedStudents)
    ? allowedStudents
    : allowedStudents
    ? [allowedStudents]
    : [];

  return this.materialsService.uploadMaterial(
    file,
    tutorProfileId,
    studentsArray
  );
}

  @Get("tutor/:tutorProfileId")
  async getTutorMaterials(@Param("tutorProfileId") id: string) {
    return this.materialsService.getMaterialsForTutor(id);
  }

  @Get("student/:studentProfileId")
  async getStudentMaterials(@Param("studentProfileId") id: string) {
    return this.materialsService.getMaterialsForStudent(id);
  }
}
