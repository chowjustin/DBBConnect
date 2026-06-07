import { Type } from 'class-transformer';
import {
  IsArray,
  IsInt,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';

export class AvailabilitySlotDto {
  @IsInt() @Min(0) @Max(6)
  dayOfWeek: number;

  @IsInt() @Min(0) @Max(1440)
  startMin: number;

  @IsInt() @Min(0) @Max(1440)
  endMin: number;

  @IsString()
  timezone: string;
}

export class ReplaceAvailabilityDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AvailabilitySlotDto)
  slots: AvailabilitySlotDto[];
}
