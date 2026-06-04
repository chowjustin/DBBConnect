import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  Req,
  UseGuards,
  Param,
  Get,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadService } from './upload.service';
import { multerStorage, imageFileFilter, materialFileFilter } from './multer.config';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Request } from 'express';
import { StreamableFile } from '@nestjs/common';
import fs from 'fs';

@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  // ----------------------------
  // PROFILE PICTURE
  // ----------------------------
  @Post('profile-picture')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('profile-picture', {
      storage: multerStorage,
      fileFilter: imageFileFilter,
    }),
  )
  async uploadProfilePicture(
    @UploadedFile() file: Express.Multer.File,
    @Req() req: Request & { user: { sub: string } },
  ) {
    if (!file) throw new BadRequestException('No file uploaded');
    return this.uploadService.saveProfilePicture(req.user.sub, file);
  }

  // ----------------------------
  // TUTOR MATERIAL
  // ----------------------------
  @Post('material')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('material', {
      storage: multerStorage,
      fileFilter: materialFileFilter,
    }),
  )
  async uploadMaterial(
    @UploadedFile() file: Express.Multer.File,
    @Req() req: Request & { user: { sub: string; role?: string } },
  ) {
    if (!file) throw new BadRequestException('No file uploaded');
    return this.uploadService.saveMaterial(req.user.sub, file);
  }

  // ----------------------------
  // DOWNLOAD MATERIAL (student access)
  // ----------------------------
  @Get('material/:materialId')
  @UseGuards(JwtAuthGuard)
  async downloadMaterial(
    @Param('materialId') materialId: string,
    @Req() req: Request & { user: { sub: string } },
  ): Promise<StreamableFile> {
    const material = await this.uploadService.getMaterial(materialId, req.user.sub);

    const fileStream = fs.createReadStream(material.fileUrl);
    return new StreamableFile(fileStream);
  }
}
