import { ApiPropertyOptional } from '@nestjs/swagger';
import { EducationLevel, MaterialKind, Subject } from '@prisma/client';
import { Transform } from 'class-transformer';
import { IsEnum, IsOptional } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';

const upper = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.toUpperCase() : value;

export class MaterialFilterQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ enum: Subject })
  @IsOptional()
  @Transform(upper)
  @IsEnum(Subject)
  subject?: Subject;

  @ApiPropertyOptional({ enum: EducationLevel })
  @IsOptional()
  @Transform(upper)
  @IsEnum(EducationLevel)
  level?: EducationLevel;

  @ApiPropertyOptional({ enum: MaterialKind })
  @IsOptional()
  @Transform(upper)
  @IsEnum(MaterialKind)
  kind?: MaterialKind;
}
