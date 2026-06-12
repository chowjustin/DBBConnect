import { IsEnum, IsOptional, IsString } from 'class-validator';
import { PaymentKind, PaymentMethod } from '@prisma/client';

export class UploadProofDto {
  @IsEnum(PaymentKind)
  kind: PaymentKind;

  @IsString()
  refId: string;

  @IsEnum(PaymentMethod)
  method: PaymentMethod;

  @IsOptional()
  @IsString()
  promoCode?: string;

  /** Absolute file_url returned by POST /upload/file?kind=payment. */
  @IsString()
  proofUrl: string;
}

export class RejectPaymentDto {
  @IsString()
  notes: string;
}
