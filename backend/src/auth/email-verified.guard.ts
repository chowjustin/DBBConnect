import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../prisma/prisma.service';
import { EMAIL_VERIFIED_KEY } from './email-verified.decorator';

@Injectable()
export class EmailVerifiedGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const required = this.reflector.getAllAndOverride<boolean>(
      EMAIL_VERIFIED_KEY,
      [ctx.getHandler(), ctx.getClass()],
    );
    if (!required) return true;

    // Dev/staging bypass. Refuses in production regardless of env.
    if (
      process.env.NODE_ENV !== 'production' &&
      process.env.DEV_BYPASS_EMAIL_VERIFICATION === 'true'
    ) {
      return true;
    }

    const req = ctx.switchToHttp().getRequest();
    if (!req.user?.sub) throw new ForbiddenException('Not authenticated');

    const user = await this.prisma.user.findUnique({
      where: { id: req.user.sub },
      select: { emailVerifiedAt: true },
    });
    if (!user?.emailVerifiedAt) {
      throw new ForbiddenException('Email verification required');
    }
    return true;
  }
}
