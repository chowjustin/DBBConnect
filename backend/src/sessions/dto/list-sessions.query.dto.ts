import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsOptional } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';

const toBool = ({ value }: { value: unknown }) => {
  if (typeof value === 'boolean') return value;
  if (value === 'true' || value === '1') return true;
  if (value === 'false' || value === '0') return false;
  return value;
};

export class ListSessionsQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ description: 'Only return past sessions.' })
  @IsOptional()
  @Transform(toBool)
  @IsBoolean()
  past?: boolean = false;
}
