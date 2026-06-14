import { IsDateString } from 'class-validator';

export class RescheduleSessionDto {
  @IsDateString()
  startsAt: string;

  @IsDateString()
  endsAt: string;
}
