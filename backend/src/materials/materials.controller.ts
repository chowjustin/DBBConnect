import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Param,
  Post,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  EducationLevel,
  MaterialKind,
  Subject,
  UserRole,
} from '@prisma/client';
import type { Request } from 'express';
import { MaterialsService } from './materials.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import {
  materialFileFilter,
  multerLimits,
  multerStorage,
} from '../upload/multer.config';

type AuthedRequest = Request & {
  user: { sub: string; email: string; role: UserRole };
};

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('materials')
export class MaterialsController {
  constructor(private readonly materialsService: MaterialsService) {}

  @Roles(UserRole.TUTOR)
  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: multerStorage,
      fileFilter: materialFileFilter,
      limits: multerLimits,
    }),
  )
  async uploadMaterial(
    @UploadedFile() file: Express.Multer.File,
    @Req() req: AuthedRequest,
    @Body('allowedStudents') allowedStudents: string | string[],
  ) {
    const studentsArray = Array.isArray(allowedStudents)
      ? allowedStudents
      : allowedStudents
        ? [allowedStudents]
        : [];

    return this.materialsService.uploadMaterial(
      file,
      req.user.sub,
      studentsArray,
    );
  }

  @Get('tutor/:tutorProfileId')
  async getTutorMaterials(
    @Param('tutorProfileId') tutorProfileId: string,
    @Req() req: AuthedRequest,
    @Query('subject') subject?: string,
    @Query('level') level?: string,
    @Query('kind') kind?: string,
  ) {
    const ok = await this.materialsService.userOwnsTutorProfile(
      req.user.sub,
      tutorProfileId,
    );
    if (!ok) throw new ForbiddenException('Not your tutor profile');
    return this.materialsService.getMaterialsForTutor(tutorProfileId, {
      subject: this.parseSubject(subject),
      level: this.parseLevel(level),
      kind: this.parseKind(kind),
    });
  }

  @Get('student/:studentProfileId')
  async getStudentMaterials(
    @Param('studentProfileId') studentProfileId: string,
    @Req() req: AuthedRequest,
    @Query('subject') subject?: string,
    @Query('level') level?: string,
    @Query('kind') kind?: string,
  ) {
    const ok = await this.materialsService.userOwnsStudentProfile(
      req.user.sub,
      studentProfileId,
    );
    if (!ok) throw new ForbiddenException('Not your student profile');
    return this.materialsService.getMaterialsForStudent(studentProfileId, {
      subject: this.parseSubject(subject),
      level: this.parseLevel(level),
      kind: this.parseKind(kind),
    });
  }

  private parseSubject(v?: string): Subject | undefined {
    if (!v) return undefined;
    const u = v.toUpperCase();
    return Object.keys(Subject).includes(u) ? (u as Subject) : undefined;
  }
  private parseLevel(v?: string): EducationLevel | undefined {
    if (!v) return undefined;
    const u = v.toUpperCase();
    return Object.keys(EducationLevel).includes(u)
      ? (u as EducationLevel)
      : undefined;
  }
  private parseKind(v?: string): MaterialKind | undefined {
    if (!v) return undefined;
    const u = v.toUpperCase();
    return Object.keys(MaterialKind).includes(u)
      ? (u as MaterialKind)
      : undefined;
  }
}
