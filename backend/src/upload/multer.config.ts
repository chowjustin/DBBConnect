import { diskStorage } from 'multer';
import { extname } from 'path';
import { randomUUID } from 'crypto';
import { BadRequestException } from '@nestjs/common';
import type { Request } from 'express';

type CbVoid = (error: Error | null, destination: string) => void;
type CbBool = (error: Error | null, acceptFile: boolean) => void;

const FIELD_TO_FOLDER: Record<string, string> = {
  'profile-picture': './uploads/profile',
  material: './uploads/materials',
  file: './uploads/materials',
};

export const multerStorage = diskStorage({
  destination: (_req: Request, file: Express.Multer.File, cb: CbVoid) => {
    const folder = FIELD_TO_FOLDER[file.fieldname];
    if (!folder) {
      cb(new BadRequestException(`Unsupported upload field: ${file.fieldname}`), '');
      return;
    }
    cb(null, folder);
  },
  filename: (_req: Request, file: Express.Multer.File, cb: CbVoid) => {
    const ext = extname(file.originalname).toLowerCase();
    cb(null, `${randomUUID()}${ext}`);
  },
});

const IMAGE_MIME = /^image\/(png|jpe?g)$/;

export const imageFileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: CbBool,
) => {
  if (!IMAGE_MIME.test(file.mimetype)) {
    cb(new BadRequestException('Only PNG or JPEG images allowed'), false);
    return;
  }
  cb(null, true);
};

export const materialFileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: CbBool,
) => {
  if (IMAGE_MIME.test(file.mimetype) || file.mimetype === 'application/pdf') {
    cb(null, true);
    return;
  }
  cb(new BadRequestException('Only PNG, JPEG or PDF allowed'), false);
};

export const multerLimits = {
  fileSize: 20 * 1024 * 1024,
};
