import { IsInt, IsString, Min } from 'class-validator';

export class RequestPayoutDto {
  @IsInt()
  @Min(1)
  amount: number;
}

export class RejectPayoutDto {
  @IsString()
  reason: string;
}

export class MarkPaidPayoutDto {
  /** Absolute file_url returned by POST /upload/file?kind=payout. */
  @IsString()
  proofUrl: string;
}
