import { ApiProperty } from '@nestjs/swagger';
import { IsIn } from 'class-validator';
import type { UploadKind } from '../upload.service';

export const UPLOAD_KINDS: UploadKind[] = [
  'profile',
  'material',
  'verification',
  'payment',
  'payout',
];

export class UploadFileQueryDto {
  @ApiProperty({ enum: UPLOAD_KINDS })
  @IsIn(UPLOAD_KINDS)
  kind!: UploadKind;
}
