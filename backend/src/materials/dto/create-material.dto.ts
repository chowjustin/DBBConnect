import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EducationLevel, MaterialKind, Subject } from '@prisma/client';
import {
  ArrayUnique,
  IsArray,
  IsEnum,
  IsOptional,
  IsString,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateMaterialDto {
  @ApiProperty({ description: 'Relative path of uploaded file.' })
  @IsString()
  fileUrl: string;

  @ApiProperty({ description: 'Original filename as uploaded.' })
  @IsString()
  originalName: string;

  @ApiPropertyOptional({
    description: 'Student profile IDs allowed to view. Accepts string or array.',
    type: [String],
  })
  @IsOptional()
  @Transform(({ value }) => (Array.isArray(value) ? value : value ? [value] : []))
  @IsArray()
  @ArrayUnique()
  @IsString({ each: true })
  allowedStudents?: string[];

  @ApiPropertyOptional({ enum: Subject })
  @IsOptional()
  @IsEnum(Subject)
  subject?: Subject;

  @ApiPropertyOptional({ enum: EducationLevel })
  @IsOptional()
  @IsEnum(EducationLevel)
  level?: EducationLevel;

  @ApiPropertyOptional({ enum: MaterialKind })
  @IsOptional()
  @IsEnum(MaterialKind)
  kind?: MaterialKind;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;
}
