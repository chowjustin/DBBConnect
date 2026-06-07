import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { isValidIanaTz } from '../common/tz';
import { AvailabilitySlotDto } from './dto/availability.dto';

@Injectable()
export class AvailabilityService {
  constructor(private prisma: PrismaService) {}

  async replace(tutorEmail: string, slots: AvailabilitySlotDto[]) {
    for (const s of slots) {
      if (s.startMin >= s.endMin) {
        throw new BadRequestException('startMin must be < endMin');
      }
      if (!isValidIanaTz(s.timezone)) {
        throw new BadRequestException(`Invalid timezone: ${s.timezone}`);
      }
    }
    const user = await this.prisma.user.findUnique({
      where: { email: tutorEmail },
      include: { tutorProfile: true },
    });
    if (!user?.tutorProfile) throw new NotFoundException('Tutor profile not found');
    const tutorId = user.tutorProfile.id;
    await this.prisma.$transaction([
      this.prisma.availabilitySlot.deleteMany({ where: { tutorId } }),
      this.prisma.availabilitySlot.createMany({
        data: slots.map((s) => ({
          tutorId,
          dayOfWeek: s.dayOfWeek,
          startMin: s.startMin,
          endMin: s.endMin,
          timezone: s.timezone,
        })),
      }),
    ]);
    return this.prisma.availabilitySlot.findMany({ where: { tutorId } });
  }

  async listForTutor(tutorId: string) {
    return this.prisma.availabilitySlot.findMany({
      where: { tutorId },
      orderBy: [{ dayOfWeek: 'asc' }, { startMin: 'asc' }],
    });
  }
}
