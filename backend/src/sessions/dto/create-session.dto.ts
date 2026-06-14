import {
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
} from 'class-validator';
import {
  ClassFormat,
  ClassMode,
  EducationLevel,
  Subject,
} from '@prisma/client';

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

  @IsOptional()
  @IsString()
  meetingUrl?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsArray()
  @ArrayMinSize(1)
  @IsEnum(Subject, { each: true })
  subjects: Subject[];

  @IsOptional()
  @IsEnum(EducationLevel)
  level?: EducationLevel;
}
