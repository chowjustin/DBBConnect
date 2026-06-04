import { diskStorage } from 'multer';
import { extname } from 'path';
import { BadRequestException } from '@nestjs/common';

export const multerStorage = diskStorage({
  destination: (req, file, cb) => {
    // Different folder depending on the field name
    if (file.fieldname === 'profile-picture') {
      cb(null, './uploads/profile');
    } else if (file.fieldname === 'material') {
      cb(null, './uploads/materials');
    } else {
      // Pass an Error object instead of null
      cb(new Error('Invalid file field'), './uploads'); // fallback folder
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + extname(file.originalname).toLowerCase());
  },
});

export const imageFileFilter = (req, file, cb) => {
  const allowed = /\/(jpg|jpeg|png)$/;
  if (!allowed.test(file.mimetype)) {
    return cb(new Error('Only JPG, JPEG, PNG images allowed!'), false);
  }
  cb(null, true);
};

export const materialFileFilter = (req, file, cb) => {
  const isImage = /\/(jpg|jpeg|png)$/i.test(file.mimetype);
  const isPdf = file.mimetype === 'application/pdf';

  if (!isImage && !isPdf) {
    return cb(new Error('Only images or PDF allowed!'), false);
  }
  cb(null, true);
};
