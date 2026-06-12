import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { DiscountType, PaymentKind } from '@prisma/client';

export class CreatePromoCodeDto {
  @IsString()
  code: string;

  @IsEnum(DiscountType)
  discountType: DiscountType;

  @IsInt()
  @Min(1)
  discountValue: number;

  @IsDateString()
  validUntil: string;

  @IsInt()
  @Min(1)
  maxUses: number;

  @IsArray()
  @IsEnum(PaymentKind, { each: true })
  applicableKinds: PaymentKind[];

  @IsOptional()
  @IsInt()
  @Min(0)
  minAmount?: number;
}

export class SetPromoActiveDto {
  @IsBoolean()
  active: boolean;
}

export class PreviewDiscountDto {
  @IsEnum(PaymentKind)
  kind: PaymentKind;

  @IsString()
  refId: string;

  @IsString()
  code: string;
}
