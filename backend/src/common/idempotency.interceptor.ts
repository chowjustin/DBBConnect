import {
  BadRequestException,
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, from, of, switchMap, tap } from 'rxjs';
import { PrismaService } from '../prisma/prisma.service';

const IDEMPOTENCY_TTL_MS = 7 * 24 * 60 * 60 * 1000;

@Injectable()
export class IdempotencyInterceptor implements NestInterceptor {
  constructor(private prisma: PrismaService) {}

  intercept(ctx: ExecutionContext, next: CallHandler): Observable<any> {
    const req = ctx.switchToHttp().getRequest();
    const key = req.headers['idempotency-key'] as string | undefined;
    if (!key) {
      throw new BadRequestException('Idempotency-Key header required');
    }
    const userId = req.user?.sub;
    if (!userId) return next.handle();

    return from(
      this.prisma.idempotencyKey.findUnique({ where: { key } }),
    ).pipe(
      switchMap((existing) => {
        if (existing) {
          if (existing.userId !== userId) {
            throw new BadRequestException('Idempotency key conflict');
          }
          if (
            Date.now() - existing.createdAt.getTime() <
            IDEMPOTENCY_TTL_MS
          ) {
            return of(existing.responseSnapshot);
          }
        }
        return next.handle().pipe(
          tap(async (response) => {
            await this.prisma.idempotencyKey
              .upsert({
                where: { key },
                update: {
                  responseSnapshot: response as any,
                  userId,
                  endpoint: req.url,
                },
                create: {
                  key,
                  userId,
                  endpoint: req.url,
                  responseSnapshot: response as any,
                },
              })
              .catch(() => {});
          }),
        );
      }),
    );
  }
}
