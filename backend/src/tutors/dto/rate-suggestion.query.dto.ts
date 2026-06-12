import { ApiPropertyOptional } from '@nestjs/swagger';
import { EducationLevel, Subject } from '@prisma/client';
import { Transform } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, Min } from 'class-validator';

const upper = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.toUpperCase() : value;

const toInt = ({ value }: { value: unknown }) =>
  value === undefined || value === null || value === ''
    ? undefined
    : parseInt(String(value), 10);

export class RateSuggestionQueryDto {
  @ApiPropertyOptional({ enum: Subject })
  @IsOptional()
  @Transform(upper)
  @IsEnum(Subject)
  subject?: Subject;

  @ApiPropertyOptional({ enum: EducationLevel })
  @IsOptional()
  @Transform(upper)
  @IsEnum(EducationLevel)
  educationLevel?: EducationLevel;

  @ApiPropertyOptional({ description: 'Years of teaching experience.' })
  @IsOptional()
  @Transform(toInt)
  @IsInt()
  @Min(0)
  experience?: number;
}
