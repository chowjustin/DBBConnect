import { PartialType } from '@nestjs/mapped-types';
import { CreateTutorDto } from './create-tutor.dto';
import { IsOptional, IsString, IsNumber, IsArray, IsObject } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateTutorDto extends PartialType(CreateTutorDto) {}
