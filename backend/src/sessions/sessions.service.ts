import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  ApplicationStatus,
  ClassFormat,
  PaymentKind,
  PaymentStatus,
  Prisma,
  SessionStatus,
  UserRole,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { PaginationQueryDto } from '../common/dto/pagination.dto';
import { paginateArray, paginatePrisma } from '../common/paginate';
import { paginated } from '../common/dto/paginated.dto';
import { isInsideSlot } from '../common/tz';
import { CreateSessionDto } from './dto/create-session.dto';

function attendeeBounds(format: ClassFormat): { min: number; max: number } {
  switch (format) {
    case ClassFormat.PRIVATE_1:
      return { min: 1, max: 1 };
    case ClassFormat.SEMI_PRIVATE:
      return { min: 2, max: 3 };
    case ClassFormat.GROUP:
      return { min: 4, max: 20 };
  }
}

@Injectable()
export class SessionsService {
  constructor(
    private prisma: PrismaService,
    private mail: MailService,
  ) {}

  async create(studentEmail: string, dto: CreateSessionDto) {
    const start = new Date(dto.startsAt);
    const end = new Date(dto.endsAt);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      throw new BadRequestException('Invalid startsAt or endsAt');
    }
    if (end <= start) {
      throw new BadRequestException('endsAt must be after startsAt');
    }
    if ((end.getTime() - start.getTime()) / 1000 > 4 * 3600) {
      throw new BadRequestException('Session too long (>4h)');
    }
    if (start.getTime() < Date.now() + 30 * 60 * 1000) {
      throw new BadRequestException('Must book at least 30 minutes ahead');
    }
    const bounds = attendeeBounds(dto.format);
    if (
      dto.attendeeStudentIds.length < bounds.min ||
      dto.attendeeStudentIds.length > bounds.max
    ) {
      throw new BadRequestException(
        `Format ${dto.format} requires ${bounds.min}-${bounds.max} attendees`,
      );
    }

    const requester = await this.prisma.user.findUnique({
      where: { email: studentEmail },
      include: { studentProfile: true },
    });
    if (!requester?.studentProfile) {
      throw new ForbiddenException('Only students can book');
    }
    if (!dto.attendeeStudentIds.includes(requester.studentProfile.id)) {
      throw new BadRequestException('Requester must be among attendees');
    }

    const tutor = await this.prisma.tutorProfile.findUnique({
      where: { id: dto.tutorId },
      include: { user: true },
    });
    if (!tutor) throw new NotFoundException('Tutor not found');

    // All attendees must have ACCEPTED application
    const apps = await this.prisma.application.findMany({
      where: {
        tutorId: dto.tutorId,
        studentId: { in: dto.attendeeStudentIds },
        status: ApplicationStatus.ACCEPTED,
      },
    });
    if (apps.length !== dto.attendeeStudentIds.length) {
      throw new ForbiddenException(
        'All attendees must have an accepted application',
      );
    }

    // Slot match
    const slots = await this.prisma.availabilitySlot.findMany({
      where: { tutorId: dto.tutorId },
    });
    const fits = slots.some((s) => isInsideSlot({ start, end }, s));
    if (!fits) {
      throw new BadRequestException(
        'Time is outside tutor availability',
      );
    }

    // Blackout
    const blackout = await this.prisma.blackoutDate.findFirst({
      where: {
        tutorId: dto.tutorId,
        startsAt: { lt: end },
        endsAt: { gt: start },
      },
    });
    if (blackout) throw new ConflictException('Tutor blackout period');

    // Tutor overlap
    const tutorOverlap = await this.prisma.session.findFirst({
      where: {
        tutorId: dto.tutorId,
        status: SessionStatus.SCHEDULED,
        startsAt: { lt: end },
        endsAt: { gt: start },
      },
    });
    if (tutorOverlap) throw new ConflictException('Tutor already booked');

    // Student overlap (each attendee)
    const studentOverlap = await this.prisma.sessionAttendee.findFirst({
      where: {
        studentId: { in: dto.attendeeStudentIds },
        session: {
          status: SessionStatus.SCHEDULED,
          startsAt: { lt: end },
          endsAt: { gt: start },
        },
      },
    });
    if (studentOverlap) throw new ConflictException('Attendee already booked');

    // Server-computed price: hourly rate × duration (in hours, rounded up to nearest 15 min block).
    // Client-sent pricePerSeat is ignored (per money-trust policy).
    const hourlyRate = tutor.hourlyRate ?? 0;
    const durationMs = end.getTime() - start.getTime();
    const durationHours = durationMs / (60 * 60 * 1000);
    const computedPricePerSeat = Math.round(hourlyRate * durationHours);

    return this.prisma.$transaction(async (tx) => {
      const session = await tx.session.create({
        data: {
          tutorId: dto.tutorId,
          startsAt: start,
          endsAt: end,
          format: dto.format,
          mode: dto.mode,
          subjects: dto.subjects,
          level: dto.level,
          pricePerSeat: computedPricePerSeat,
          meetingUrl: dto.meetingUrl,
          location: dto.location,
          notes: dto.notes,
          attendees: {
            create: dto.attendeeStudentIds.map((sid) => ({ studentId: sid })),
          },
        },
        include: { attendees: true },
      });
      // mail tutor
      this.mail
        .sendEmail(
          tutor.user.email,
          'New session booked',
          `Session booked at ${start.toISOString()}`,
        )
        .catch(() => {});
      return session;
    });
  }

  async updateStatus(
    actorEmail: string,
    actorRole: string,
    sessionId: string,
    status: SessionStatus,
  ) {
    const session = await this.prisma.session.findUnique({
      where: { id: sessionId },
      include: { tutor: { include: { user: true } }, attendees: true },
    });
    if (!session) throw new NotFoundException('Session not found');
    if (session.status !== SessionStatus.SCHEDULED) {
      throw new BadRequestException(
        `Cannot transition from terminal status ${session.status}`,
      );
    }
    if (status === SessionStatus.SCHEDULED) {
      throw new BadRequestException('Cannot set back to SCHEDULED');
    }
    // tutor can mark COMPLETED / NO_SHOW; both parties can CANCEL
    if (
      (status === SessionStatus.COMPLETED || status === SessionStatus.NO_SHOW) &&
      session.tutor.user.email !== actorEmail
    ) {
      throw new ForbiddenException('Only tutor can finalize');
    }
    return this.prisma.session.update({
      where: { id: sessionId },
      data: { status },
    });
  }

  async listForStudent(
    email: string,
    pagination: PaginationQueryDto,
    past = false,
  ) {
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: { studentProfile: true },
    });
    if (!user?.studentProfile) return paginated([], 0);

    const result = await paginatePrisma<any>(this.prisma.session, pagination, {
      where: {
        attendees: { some: { studentId: user.studentProfile.id } },
        startsAt: past ? { lt: new Date() } : { gte: new Date() },
      },
      include: { tutor: { include: { user: true } }, attendees: true },
      orderBy: { startsAt: past ? 'desc' : 'asc' },
    });

    const attendeeIds = result.data.flatMap((s: any) =>
      s.attendees.map((a: any) => a.id),
    );
    const payments = attendeeIds.length
      ? await this.prisma.payment.findMany({
          where: { sessionAttendeeId: { in: attendeeIds } },
          select: { id: true, sessionAttendeeId: true, status: true },
        })
      : [];
    const byAttendee = new Map(payments.map((p) => [p.sessionAttendeeId, p]));

    result.data = result.data.map((s: any) => ({
      ...s,
      attendees: s.attendees.map((a: any) => ({
        ...a,
        payment: byAttendee.get(a.id)
          ? {
              id: byAttendee.get(a.id)!.id,
              status: byAttendee.get(a.id)!.status,
            }
          : null,
      })),
    }));

    return result;
  }

  async listForTutor(
    email: string,
    pagination: PaginationQueryDto,
    past = false,
  ) {
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: { tutorProfile: true },
    });
    if (!user?.tutorProfile) return paginated([], 0);
    const result = await paginatePrisma<any>(this.prisma.session, pagination, {
      where: {
        tutorId: user.tutorProfile.id,
        startsAt: past ? { lt: new Date() } : { gte: new Date() },
      },
      include: {
        attendees: { include: { student: { include: { user: true } } } },
      },
      orderBy: { startsAt: past ? 'desc' : 'asc' },
    });

    const attendeeIds = result.data.flatMap((s: any) =>
      s.attendees.map((a: any) => a.id),
    );
    const payments = attendeeIds.length
      ? await this.prisma.payment.findMany({
          where: { sessionAttendeeId: { in: attendeeIds } },
          select: { id: true, sessionAttendeeId: true, status: true },
        })
      : [];
    const byAttendee = new Map(payments.map((p) => [p.sessionAttendeeId, p]));

    result.data = result.data.map((s: any) => ({
      ...s,
      attendees: s.attendees.map((a: any) => ({
        ...a,
        payment: byAttendee.get(a.id)
          ? {
              id: byAttendee.get(a.id)!.id,
              status: byAttendee.get(a.id)!.status,
            }
          : null,
      })),
    }));

    return result;
  }

  async cancel(
    userId: string,
    userRole: UserRole,
    sessionId: string,
    reason?: string,
  ) {
    const session = await this.prisma.session.findUnique({
      where: { id: sessionId },
      include: {
        tutor: { include: { user: true } },
        attendees: {
          include: {
            student: { include: { user: true } },
            payment: true,
          },
        },
      },
    });
    if (!session) throw new NotFoundException('Session not found');
    if (session.status !== SessionStatus.SCHEDULED) {
      throw new BadRequestException('Session sudah tidak dapat dibatalkan');
    }
    if (session.startsAt.getTime() <= Date.now()) {
      throw new BadRequestException('Sesi sudah dimulai atau lewat');
    }

    // Authorize: tutor owner or any attendee.
    const isTutorOwner =
      userRole === UserRole.TUTOR && session.tutor.user.id === userId;
    const isAttendee = session.attendees.some(
      (a) => a.student.user.id === userId,
    );
    if (!isTutorOwner && !isAttendee) {
      throw new ForbiddenException('Tidak diizinkan membatalkan sesi ini');
    }

    // Policy: cannot cancel once any attendee has a live payment (under review or confirmed).
    // Must reschedule instead.
    const hasLivePayment = session.attendees.some(
      (a) =>
        a.payment &&
        a.payment.kind === PaymentKind.SESSION &&
        (a.payment.status === PaymentStatus.UNDER_REVIEW ||
          a.payment.status === PaymentStatus.CONFIRMED),
    );
    if (hasLivePayment) {
      throw new BadRequestException(
        'Sesi yang sudah dibayar tidak dapat dibatalkan. Gunakan jadwal ulang.',
      );
    }

    return this.prisma.session.update({
      where: { id: sessionId },
      data: {
        status: SessionStatus.CANCELED,
        canceledAt: new Date(),
        canceledById: userId,
        cancelReason: reason ?? null,
      },
      include: { attendees: true },
    });
  }

  async reschedule(
    userId: string,
    userRole: UserRole,
    sessionId: string,
    newStartsAt: string,
    newEndsAt: string,
  ) {
    const start = new Date(newStartsAt);
    const end = new Date(newEndsAt);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      throw new BadRequestException('Invalid startsAt or endsAt');
    }
    if (end <= start) {
      throw new BadRequestException('endsAt must be after startsAt');
    }
    if ((end.getTime() - start.getTime()) / 1000 > 4 * 3600) {
      throw new BadRequestException('Session too long (>4h)');
    }
    if (start.getTime() < Date.now() + 30 * 60 * 1000) {
      throw new BadRequestException('Must reschedule at least 30 minutes ahead');
    }

    const session = await this.prisma.session.findUnique({
      where: { id: sessionId },
      include: {
        tutor: { include: { user: true } },
        attendees: { include: { student: { include: { user: true } } } },
      },
    });
    if (!session) throw new NotFoundException('Session not found');
    if (session.status !== SessionStatus.SCHEDULED) {
      throw new BadRequestException('Hanya sesi terjadwal yang bisa diubah');
    }

    // Reschedule preserves duration (price is tied to it).
    const originalDuration =
      session.endsAt.getTime() - session.startsAt.getTime();
    const newDuration = end.getTime() - start.getTime();
    if (newDuration !== originalDuration) {
      throw new BadRequestException(
        'Durasi sesi harus sama dengan sebelumnya',
      );
    }

    const isTutorOwner =
      userRole === UserRole.TUTOR && session.tutor.user.id === userId;
    const isAttendee = session.attendees.some(
      (a) => a.student.user.id === userId,
    );
    if (!isTutorOwner && !isAttendee) {
      throw new ForbiddenException('Tidak diizinkan menjadwalkan ulang');
    }

    const slots = await this.prisma.availabilitySlot.findMany({
      where: { tutorId: session.tutorId },
    });
    if (!slots.some((s) => isInsideSlot({ start, end }, s))) {
      throw new BadRequestException('Waktu di luar ketersediaan tutor');
    }

    const blackout = await this.prisma.blackoutDate.findFirst({
      where: {
        tutorId: session.tutorId,
        startsAt: { lt: end },
        endsAt: { gt: start },
      },
    });
    if (blackout) throw new ConflictException('Tutor blackout period');

    const tutorOverlap = await this.prisma.session.findFirst({
      where: {
        id: { not: sessionId },
        tutorId: session.tutorId,
        status: SessionStatus.SCHEDULED,
        startsAt: { lt: end },
        endsAt: { gt: start },
      },
    });
    if (tutorOverlap) throw new ConflictException('Tutor sudah ada sesi lain');

    const attendeeIds = session.attendees.map((a) => a.studentId);
    const studentOverlap = await this.prisma.sessionAttendee.findFirst({
      where: {
        studentId: { in: attendeeIds },
        session: {
          id: { not: sessionId },
          status: SessionStatus.SCHEDULED,
          startsAt: { lt: end },
          endsAt: { gt: start },
        },
      },
    });
    if (studentOverlap) {
      throw new ConflictException('Peserta sudah ada sesi lain pada waktu itu');
    }

    return this.prisma.session.update({
      where: { id: sessionId },
      data: { startsAt: start, endsAt: end },
      include: { attendees: true },
    });
  }

  async ical(sessionId: string): Promise<string> {
    const s = await this.prisma.session.findUnique({
      where: { id: sessionId },
      include: { tutor: { include: { user: true } } },
    });
    if (!s) throw new NotFoundException('Session not found');
    const fmt = (d: Date) =>
      d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    return [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'BEGIN:VEVENT',
      `UID:${s.id}@tutorconnect`,
      `DTSTAMP:${fmt(new Date())}`,
      `DTSTART:${fmt(s.startsAt)}`,
      `DTEND:${fmt(s.endsAt)}`,
      `SUMMARY:Tutoring session with ${s.tutor.user.name}`,
      s.meetingUrl ? `URL:${s.meetingUrl}` : '',
      'END:VEVENT',
      'END:VCALENDAR',
    ]
      .filter(Boolean)
      .join('\r\n');
  }
}
