import { 
  IsOptional, 
  IsString, 
  IsNumber, 
  IsArray, 
  IsObject, 
  IsEnum 
} from 'class-validator';
import { Type } from 'class-transformer';
import { Subject as Subjects } from '@prisma/client';

export class CreateStudentDto {
  @IsOptional()
  @IsString()
  bio?: string;

  @IsArray()
  @IsEnum(Subjects, { each: true })
  interests?: Subjects[];

  @IsString() 
  school?: string;
}
