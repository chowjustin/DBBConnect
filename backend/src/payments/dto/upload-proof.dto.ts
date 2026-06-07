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
}

export class RejectPaymentDto {
  @IsString()
  notes: string;
}
