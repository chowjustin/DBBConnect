import {
  IsOptional,
  IsString,
  IsNumber,
  IsArray,
  IsObject,
  IsEnum,
  IsUrl,
  Matches,
} from 'class-validator';
import { Type } from 'class-transformer';
import { Subject, EducationLevel, TeachingMethod } from '@prisma/client';

const WA_REGEX = /^\+?[1-9]\d{7,14}$/;

export class CreateTutorDto {
  @IsOptional()
  @IsString()
  bio?: string;

  @IsNumber({}, { message: 'hourlyRate must be a number' })
  @Type(() => Number)
  hourlyRate: number;

  @IsArray()
  @IsEnum(Subject, { each: true })
  subjects: Subject[];

  @IsOptional()
  @IsString()
  @Matches(WA_REGEX, { message: 'whatsappNumber must be E.164 format' })
  whatsappNumber?: string;

  @IsOptional()
  @IsString()
  educationBackground?: string;

  @IsOptional()
  @IsArray()
  @IsEnum(EducationLevel, { each: true })
  educationLevels?: EducationLevel[];

  @IsOptional()
  @IsArray()
  @IsEnum(TeachingMethod, { each: true })
  teachingMethods?: TeachingMethod[];

  @IsOptional()
  @IsUrl()
  introVideoUrl?: string;

  @IsOptional()
  @IsString()
  bankName?: string;

  @IsOptional()
  @IsString()
  bankAccountNumber?: string;

  @IsOptional()
  @IsString()
  bankAccountHolder?: string;
}
