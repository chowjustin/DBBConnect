import {
  BadRequestException,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  StreamableFile,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Request } from 'express';
import { S3Service } from '../s3/s3.service';
import { UploadService } from './upload.service';
import {
  imageFileFilter,
  materialFileFilter,
  multerLimits,
  multerStorage,
  objectKey,
} from './multer.config';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { s3KeyFromUrl } from './key.util';
import { UploadFileQueryDto } from './dto/upload-file.query.dto';

@Controller('upload')
export class UploadController {
  constructor(
    private readonly uploadService: UploadService,
    private readonly s3: S3Service,
  ) {}

  @Post('profile-picture')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('profile-picture', {
      storage: multerStorage,
      fileFilter: imageFileFilter,
      limits: multerLimits,
    }),
  )
  async uploadProfilePicture(
    @UploadedFile() file: Express.Multer.File,
    @Req() req: Request & { user: { sub: string } },
  ) {
    if (!file) throw new BadRequestException('No file uploaded');
    return this.uploadService.saveProfilePicture(req.user.sub, file, req);
  }

  /**
   * Generic verification document upload (KTP, ijazah). Returns
   * { file_url, path } so the client can attach paths to POST /tutors/verification.
   */
  @Post('verification-doc')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('verification-doc', {
      storage: multerStorage,
      fileFilter: materialFileFilter,
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  async uploadVerificationDoc(
    @UploadedFile() file: Express.Multer.File,
    @Req() req: Request,
  ) {
    if (!file) throw new BadRequestException('No file uploaded');
    const key = objectKey('verification', file.originalname);
    await this.s3.putObject(key, file.buffer, file.mimetype);
    return this.uploadService.buildFileInfo(req, 'verification', key);
  }

  /**
   * Generic 2-step upload. Client uploads file here, gets back
   * `{ path }`, then sends `path` in the JSON body of the create/update call
   * (e.g. POST /materials, POST /payments/upload-proof).
   */
  @Post('file')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: multerStorage,
      fileFilter: materialFileFilter,
      limits: multerLimits,
    }),
  )
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Query() query: UploadFileQueryDto,
    @Req() req: Request,
  ) {
    if (!file) throw new BadRequestException('No file uploaded');
    const k = query.kind;
    const folderKeyPrefix =
      k === 'material'
        ? 'materials'
        : k === 'payment'
          ? 'payments'
          : k === 'payout'
            ? 'payouts'
            : k;
    const key = objectKey(folderKeyPrefix, file.originalname);
    await this.s3.putObject(key, file.buffer, file.mimetype);
    return this.uploadService.buildFileInfo(req, k, key);
  }

  @Get('material/:materialId')
  @UseGuards(JwtAuthGuard)
  async downloadMaterial(
    @Param('materialId') materialId: string,
    @Req() req: Request & { user: { sub: string } },
  ): Promise<StreamableFile> {
    const material = await this.uploadService.getMaterial(
      materialId,
      req.user.sub,
    );
    const key = s3KeyFromUrl(material.fileUrl);
    const { stream, contentType } = await this.s3.getObject(key);
    return new StreamableFile(stream, {
      type: contentType,
      disposition: `attachment; filename="${encodeURIComponent(material.title)}"`,
    });
  }
}
