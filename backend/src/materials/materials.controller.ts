import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';
import type { Request } from 'express';
import { MaterialsService } from './materials.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { CreateMaterialDto } from './dto/create-material.dto';
import { MaterialFilterQueryDto } from './dto/material-filter.query.dto';

type AuthedRequest = Request & {
  user: { sub: string; email: string; role: UserRole };
};

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('materials')
export class MaterialsController {
  constructor(private readonly materialsService: MaterialsService) {}

  @Roles(UserRole.TUTOR)
  @Post()
  async createMaterial(
    @Req() req: AuthedRequest,
    @Body() body: CreateMaterialDto,
  ) {
    return this.materialsService.createMaterial(
      body.fileUrl,
      body.originalName,
      req.user.sub,
      body.allowedStudents ?? [],
      {
        subject: body.subject,
        level: body.level,
        kind: body.kind,
        description: body.description,
      },
    );
  }

  @Get('tutor/:tutorProfileId')
  async getTutorMaterials(
    @Param('tutorProfileId') tutorProfileId: string,
    @Req() req: AuthedRequest,
    @Query() query: MaterialFilterQueryDto,
  ) {
    const ok = await this.materialsService.userOwnsTutorProfile(
      req.user.sub,
      tutorProfileId,
    );
    if (!ok) throw new ForbiddenException('Not your tutor profile');
    return this.materialsService.getMaterialsForTutor(tutorProfileId, query, {
      subject: query.subject,
      level: query.level,
      kind: query.kind,
    });
  }

  @Get('student/:studentProfileId')
  async getStudentMaterials(
    @Param('studentProfileId') studentProfileId: string,
    @Req() req: AuthedRequest,
    @Query() query: MaterialFilterQueryDto,
  ) {
    const ok = await this.materialsService.userOwnsStudentProfile(
      req.user.sub,
      studentProfileId,
    );
    if (!ok) throw new ForbiddenException('Not your student profile');
    return this.materialsService.getMaterialsForStudent(
      studentProfileId,
      query,
      {
        subject: query.subject,
        level: query.level,
        kind: query.kind,
      },
    );
  }
}
