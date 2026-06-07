import { Injectable, NotFoundException } from '@nestjs/common';
import {
  ApplicationStatus,
  PaymentStatus,
  PlanTier,
  SessionStatus,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardsService {
  constructor(private prisma: PrismaService) {}

  async tutor(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: { tutorProfile: true },
    });
    if (!user?.tutorProfile) throw new NotFoundException('Tutor not found');
    const tutorId = user.tutorProfile.id;

    const [
      activeStudents,
      pendingApps,
      upcomingSessions,
      materialsCount,
      rating,
      recentReviews,
      upcomingList,
      monthlyEarnings,
    ] = await Promise.all([
      this.prisma.tutorProfile.findUnique({
        where: { id: tutorId },
        select: { students: { select: { id: true } } },
      }),
      this.prisma.application.count({
        where: { tutorId, status: ApplicationStatus.PENDING },
      }),
      this.prisma.session.count({
        where: {
          tutorId,
          status: SessionStatus.SCHEDULED,
          startsAt: { gte: new Date() },
        },
      }),
      this.prisma.material.count({ where: { tutorId } }),
      this.prisma.review.aggregate({
        where: { tutorId },
        _avg: { rating: true },
        _count: { rating: true },
      }),
      this.prisma.review.findMany({
        where: { tutorId },
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: {
          student: {
            select: {
              user: { select: { id: true, name: true } },
            },
          },
        },
      }),
      this.prisma.session.findMany({
        where: {
          tutorId,
          status: SessionStatus.SCHEDULED,
          startsAt: { gte: new Date() },
        },
        orderBy: { startsAt: 'asc' },
        take: 5,
      }),
      this.prisma.payment.aggregate({
        where: {
          payeeTutorId: tutorId,
          status: PaymentStatus.CONFIRMED,
          createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
        },
        _sum: { netAmount: true },
      }),
    ]);

    return {
      activeStudentCount: activeStudents?.students.length ?? 0,
      pendingApplications: pendingApps,
      upcomingSessions,
      materialsCount,
      averageRating: rating._avg.rating ?? 0,
      reviewCount: rating._count.rating,
      recentReviews,
      upcomingSessionsList: upcomingList,
      monthlyConfirmedEarnings: monthlyEarnings._sum.netAmount ?? 0,
    };
  }

  async student(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: { studentProfile: true, subscription: true },
    });
    if (!user?.studentProfile) throw new NotFoundException('Student not found');
    const studentId = user.studentProfile.id;

    const [
      activeTutors,
      upcomingSessions,
      recentMaterials,
      apps,
      sessionsCompleted,
      hoursStudied,
      spending,
    ] = await Promise.all([
      this.prisma.studentProfile.findUnique({
        where: { id: studentId },
        select: { tutors: { select: { id: true } } },
      }),
      this.prisma.session.findMany({
        where: {
          attendees: { some: { studentId } },
          startsAt: { gte: new Date() },
        },
        orderBy: { startsAt: 'asc' },
        take: 5,
        include: { tutor: { include: { user: true } } },
      }),
      this.prisma.materialView.findMany({
        where: { studentId },
        orderBy: { viewedAt: 'desc' },
        take: 5,
        include: { material: true },
      }),
      this.prisma.application.groupBy({
        by: ['status'],
        where: { studentId },
        _count: { _all: true },
      }),
      this.prisma.session.findMany({
        where: {
          attendees: { some: { studentId } },
          status: SessionStatus.COMPLETED,
        },
        select: { startsAt: true, endsAt: true },
      }),
      this.prisma.session.findMany({
        where: {
          attendees: { some: { studentId } },
          status: SessionStatus.COMPLETED,
        },
        select: { startsAt: true, endsAt: true },
      }),
      this.prisma.payment.aggregate({
        where: {
          payerId: user.id,
          status: PaymentStatus.CONFIRMED,
          createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
        },
        _sum: { grossAmount: true },
      }),
    ]);

    const hours = hoursStudied.reduce((acc, s) => {
      return acc + (s.endsAt.getTime() - s.startsAt.getTime()) / 3_600_000;
    }, 0);

    return {
      activeTutorCount: activeTutors?.tutors.length ?? 0,
      upcomingSessions,
      recentMaterials,
      applicationCounts: Object.fromEntries(
        apps.map((a) => [a.status, a._count._all]),
      ),
      subscription: user.subscription ?? { tier: PlanTier.FREE },
      sessionsCompleted: sessionsCompleted.length,
      hoursStudied: Math.round(hours * 10) / 10,
      spendingLast30Days: spending._sum.grossAmount ?? 0,
    };
  }

  async tutorAnalytics(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: { tutorProfile: true },
    });
    if (!user?.tutorProfile) throw new NotFoundException('Tutor not found');
    const tutorId = user.tutorProfile.id;
    const since12wk = new Date(Date.now() - 12 * 7 * 24 * 60 * 60 * 1000);

    const sessions = await this.prisma.session.findMany({
      where: { tutorId, startsAt: { gte: since12wk } },
      select: { startsAt: true, status: true },
    });
    const payments = await this.prisma.payment.findMany({
      where: {
        payeeTutorId: tutorId,
        status: PaymentStatus.CONFIRMED,
        createdAt: { gte: since12wk },
      },
      select: { createdAt: true, netAmount: true },
    });
    const apps = await this.prisma.application.groupBy({
      by: ['status'],
      where: { tutorId },
      _count: { _all: true },
    });

    // bin by week
    const week = (d: Date) =>
      Math.floor((d.getTime() - since12wk.getTime()) / (7 * 24 * 60 * 60 * 1000));
    const sessionsPerWeek = Array(12).fill(0);
    sessions.forEach((s) => {
      const w = week(s.startsAt);
      if (w >= 0 && w < 12) sessionsPerWeek[w]++;
    });
    const earningsPerWeek = Array(12).fill(0);
    payments.forEach((p) => {
      const w = week(p.createdAt);
      if (w >= 0 && w < 12) earningsPerWeek[w] += p.netAmount;
    });

    return {
      sessionsPerWeek,
      earningsPerWeek,
      funnel: Object.fromEntries(apps.map((a) => [a.status, a._count._all])),
    };
  }

  async adminOverview() {
    const since30 = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const [
      dau,
      mau,
      gmv,
      commission,
      registered,
      applied,
      accepted,
      booked,
      paid,
      tutorSupply,
      topTutors,
    ] = await Promise.all([
      this.prisma.userActivity.count({ where: { lastSeenAt: { gte: since24h } } }),
      this.prisma.userActivity.count({ where: { lastSeenAt: { gte: since30 } } }),
      this.prisma.payment.aggregate({
        where: { status: PaymentStatus.CONFIRMED, createdAt: { gte: since30 } },
        _sum: { grossAmount: true },
      }),
      this.prisma.payment.aggregate({
        where: { status: PaymentStatus.CONFIRMED, createdAt: { gte: since30 } },
        _sum: { commission: true },
      }),
      this.prisma.user.count(),
      this.prisma.application.count(),
      this.prisma.application.count({ where: { status: ApplicationStatus.ACCEPTED } }),
      this.prisma.session.count(),
      this.prisma.payment.count({ where: { status: PaymentStatus.CONFIRMED } }),
      this.prisma.tutorProfile.groupBy({
        by: ['subjects'],
        where: { publishedAt: { not: null } },
      }),
      this.prisma.session.groupBy({
        by: ['tutorId'],
        where: { status: SessionStatus.COMPLETED },
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
        take: 10,
      }),
    ]);

    const gmvAmount = gmv._sum.grossAmount ?? 0;
    const commissionAmount = commission._sum.commission ?? 0;

    return {
      dau,
      mau,
      gmv: gmvAmount,
      commission: commissionAmount,
      takeRate: gmvAmount > 0 ? commissionAmount / gmvAmount : 0,
      funnel: { registered, applied, accepted, booked, paid },
      tutorSupply,
      topTutors,
    };
  }
}
