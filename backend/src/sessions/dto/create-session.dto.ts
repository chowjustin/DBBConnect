import {
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { ClassFormat, ClassMode } from '@prisma/client';

export class CreateSessionDto {
  @IsString()
  tutorId: string;

  @IsEnum(ClassFormat)
  format: ClassFormat;

  @IsEnum(ClassMode)
  mode: ClassMode;

  @IsDateString()
  startsAt: string;

  @IsDateString()
  endsAt: string;

  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  attendeeStudentIds: string[];

  @IsInt()
  @Min(0)
  pricePerSeat: number;

  @IsOptional()
  @IsString()
  meetingUrl?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
