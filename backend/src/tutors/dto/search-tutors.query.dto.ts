import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  EducationLevel,
  Subject,
  TeachingMethod,
} from '@prisma/client';
import { Transform } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';

const upper = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.toUpperCase() : value;

const toNum = ({ value }: { value: unknown }) =>
  value === undefined || value === null || value === '' ? undefined : Number(value);

const toMethods = ({ value }: { value: unknown }) => {
  if (!value) return undefined;
  const arr = Array.isArray(value)
    ? value
    : String(value).split(',');
  return arr.map((m) => String(m).toUpperCase());
};

export const SEARCH_SORT_BY = [
  'rating',
  'priceAsc',
  'priceDesc',
  'featured',
] as const;
export type SearchSortBy = (typeof SEARCH_SORT_BY)[number];

export class SearchTutorsQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ enum: Subject })
  @IsOptional()
  @Transform(upper)
  @IsEnum(Subject)
  subject?: Subject;

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(toNum)
  @IsNumber()
  @Min(0)
  minRate?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(toNum)
  @IsNumber()
  @Min(0)
  maxRate?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(toNum)
  @IsNumber()
  @Min(0)
  minRating?: number;

  @ApiPropertyOptional({ enum: EducationLevel })
  @IsOptional()
  @Transform(upper)
  @IsEnum(EducationLevel)
  educationLevel?: EducationLevel;

  @ApiPropertyOptional({
    enum: TeachingMethod,
    isArray: true,
    description: 'Comma-separated or repeated query param.',
  })
  @IsOptional()
  @Transform(toMethods)
  @IsArray()
  @IsEnum(TeachingMethod, { each: true })
  methods?: TeachingMethod[];

  @ApiPropertyOptional({ enum: SEARCH_SORT_BY })
  @IsOptional()
  @IsIn(SEARCH_SORT_BY as unknown as string[])
  sortBy?: SearchSortBy;
}
