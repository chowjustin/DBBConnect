import { SetMetadata } from '@nestjs/common';

export const EMAIL_VERIFIED_KEY = 'emailVerifiedRequired';
export const EmailVerified = () => SetMetadata(EMAIL_VERIFIED_KEY, true);
