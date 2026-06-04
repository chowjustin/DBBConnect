import { IsOptional, IsString, IsNumber, IsArray, IsObject, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { Subject as Subjects } from '@prisma/client';

export class CreateTutorDto {
  @IsOptional()
  @IsString()
  bio?: string;

  @IsNumber({}, { message: 'hourlyRate must be a number' })
  @Type(() => Number)
  hourlyRate: number;

  @IsArray()
  @IsEnum(Subjects, { each: true })
  subjects: Subjects[];

  @IsOptional()
  @IsObject()
  availability: Record<string, string[]>;
}
