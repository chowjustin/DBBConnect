import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class CreatePlatformBankDto {
  @IsString()
  bankName: string;

  @IsString()
  accountNumber: string;

  @IsString()
  accountHolder: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdatePlatformBankDto {
  @IsOptional() @IsString() bankName?: string;
  @IsOptional() @IsString() accountNumber?: string;
  @IsOptional() @IsString() accountHolder?: string;
  @IsOptional() @IsBoolean() isActive?: boolean;
  @IsOptional() @IsString() notes?: string;
}
