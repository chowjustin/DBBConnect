import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { SessionStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TrackingService {
  constructor(private prisma: PrismaService) {}

  async logMaterialView(materialId: string, studentEmail: string, durationSec?: number) {
    const user = await this.prisma.user.findUnique({
      where: { email: studentEmail },
      include: { studentProfile: true },
    });
    if (!user?.studentProfile) throw new NotFoundException('Student not found');

    const since5 = new Date(Date.now() - 5 * 60 * 1000);
    const recent = await this.prisma.materialView.findFirst({
      where: {
        materialId,
        studentId: user.studentProfile.id,
        viewedAt: { gt: since5 },
      },
    });
    if (recent) return { throttled: true };

    return this.prisma.materialView.create({
      data: {
        materialId,
        studentId: user.studentProfile.id,
        durationSec,
      },
    });
  }

  async submitFeedback(
    sessionId: string,
    studentEmail: string,
    score: number,
    comment?: string,
  ) {
    if (score < 0 || score > 10) {
      throw new BadRequestException('Score must be 0-10');
    }
    const user = await this.prisma.user.findUnique({
      where: { email: studentEmail },
      include: { studentProfile: true },
    });
    if (!user?.studentProfile) throw new NotFoundException('Student not found');

    const attendee = await this.prisma.sessionAttendee.findFirst({
      where: { sessionId, studentId: user.studentProfile.id },
      include: { session: true },
    });
    if (!attendee) throw new NotFoundException('Not an attendee');
    if (attendee.session.status !== SessionStatus.COMPLETED) {
      throw new BadRequestException('Session not completed yet');
    }
    return this.prisma.sessionFeedback.create({
      data: { sessionAttendeeId: attendee.id, score, comment },
    });
  }

  logSearch(userId: string | null, query: any, resultCount: number) {
    // fire-and-forget
    return this.prisma.searchLog
      .create({
        data: { userId, query, resultCount },
      })
      .catch((e) => console.error('search log error', e));
  }

  async npsLast30Days() {
    const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const all = await this.prisma.sessionFeedback.findMany({
      where: { createdAt: { gte: since } },
      select: { score: true },
    });
    if (all.length === 0) return { avg: 0, distribution: {} };
    const dist: Record<number, number> = {};
    for (let i = 0; i <= 10; i++) dist[i] = 0;
    let sum = 0;
    all.forEach((f) => {
      sum += f.score;
      dist[f.score] = (dist[f.score] ?? 0) + 1;
    });
    return { avg: sum / all.length, distribution: dist, sampleSize: all.length };
  }

  async searchGaps() {
    return this.prisma.searchLog.findMany({
      where: { resultCount: 0 },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }
}
