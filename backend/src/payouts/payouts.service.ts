import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PayoutStatus, VerificationStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { PaginationQueryDto } from '../common/dto/pagination.dto';
import { paginatePrisma } from '../common/paginate';
import { paginated } from '../common/dto/paginated.dto';

const MIN_PAYOUT = parseInt(process.env.MIN_PAYOUT_RUPIAH || '50000', 10);

@Injectable()
export class PayoutsService {
  constructor(
    private prisma: PrismaService,
    private mail: MailService,
  ) {}

  async getWallet(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: { tutorProfile: true },
    });
    if (!user?.tutorProfile) throw new NotFoundException('Tutor not found');
    const wallet = await this.prisma.tutorWallet.upsert({
      where: { tutorId: user.tutorProfile.id },
      update: {},
      create: { tutorId: user.tutorProfile.id },
    });
    const ledger = await this.prisma.walletLedger.findMany({
      where: { tutorId: user.tutorProfile.id },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });
    return { wallet, ledger };
  }

  async request(email: string, amount: number) {
    if (amount < MIN_PAYOUT) {
      throw new BadRequestException(`Below minimum (${MIN_PAYOUT})`);
    }
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: { tutorProfile: true },
    });
    if (!user?.tutorProfile) throw new NotFoundException('Tutor not found');
    const tutor = user.tutorProfile;
    if (tutor.verificationStatus !== VerificationStatus.VERIFIED) {
      throw new ForbiddenException('Verify your account before payout');
    }
    if (!tutor.bankName || !tutor.bankAccountNumber || !tutor.bankAccountHolder) {
      throw new BadRequestException('Bank details required');
    }
    const wallet = await this.prisma.tutorWallet.upsert({
      where: { tutorId: tutor.id },
      update: {},
      create: { tutorId: tutor.id },
    });
    if (amount > wallet.availableBalance) {
      throw new BadRequestException('Insufficient balance');
    }
    const existing = await this.prisma.payout.findFirst({
      where: { tutorId: tutor.id, status: PayoutStatus.REQUESTED },
    });
    if (existing) throw new ConflictException('Pending payout already exists');

    return this.prisma.$transaction(async (tx) => {
      const payout = await tx.payout.create({
        data: {
          tutorId: tutor.id,
          amount,
          bankName: tutor.bankName!,
          bankAccount: tutor.bankAccountNumber!,
          accountHolder: tutor.bankAccountHolder!,
          status: PayoutStatus.REQUESTED,
        },
      });
      await tx.tutorWallet.update({
        where: { tutorId: tutor.id },
        data: { availableBalance: { decrement: amount } },
      });
      await tx.walletLedger.create({
        data: {
          tutorId: tutor.id,
          delta: -amount,
          reason: 'PAYOUT_REQUESTED',
          payoutId: payout.id,
        },
      });
      return payout;
    });
  }

  async listMine(email: string, pagination: PaginationQueryDto) {
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: { tutorProfile: true },
    });
    if (!user?.tutorProfile) return paginated([], 0);
    return paginatePrisma(this.prisma.payout, pagination, {
      where: { tutorId: user.tutorProfile.id },
      orderBy: { requestedAt: 'desc' },
    });
  }

  listQueue(pagination: PaginationQueryDto) {
    return paginatePrisma(this.prisma.payout, pagination, {
      where: { status: PayoutStatus.REQUESTED },
      orderBy: { requestedAt: 'asc' },
    });
  }

  listHistory(pagination: PaginationQueryDto) {
    return paginatePrisma(this.prisma.payout, pagination, {
      where: {
        status: { in: [PayoutStatus.PAID, PayoutStatus.REJECTED] },
      },
      include: { tutor: { include: { user: true } } },
      orderBy: { paidAt: 'desc' },
    });
  }

  async markPaid(adminId: string, payoutId: string, proofUrl: string) {
    const payout = await this.prisma.payout.findUnique({
      where: { id: payoutId },
      include: { tutor: { include: { user: true } } },
    });
    if (!payout) throw new NotFoundException('Payout not found');
    if (payout.status !== PayoutStatus.REQUESTED) {
      throw new BadRequestException('Already reviewed');
    }
    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.payout.update({
        where: { id: payoutId },
        data: {
          status: PayoutStatus.PAID,
          paidAt: new Date(),
          proofUrl,
          reviewedBy: adminId,
        },
      });
      await tx.walletLedger.create({
        data: {
          tutorId: payout.tutorId,
          delta: 0,
          reason: 'PAYOUT_PAID',
          payoutId: payout.id,
        },
      });
      this.mail
        .sendEmail(
          payout.tutor.user.email,
          'Payout paid',
          `Your payout of ${payout.amount} has been transferred.`,
        )
        .catch(() => {});
      return updated;
    });
  }

  async reject(adminId: string, payoutId: string, reason: string) {
    const payout = await this.prisma.payout.findUnique({
      where: { id: payoutId },
      include: { tutor: { include: { user: true } } },
    });
    if (!payout) throw new NotFoundException('Payout not found');
    if (payout.status !== PayoutStatus.REQUESTED) {
      throw new BadRequestException('Already reviewed');
    }
    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.payout.update({
        where: { id: payoutId },
        data: {
          status: PayoutStatus.REJECTED,
          rejectionReason: reason,
          reviewedBy: adminId,
        },
      });
      await tx.tutorWallet.update({
        where: { tutorId: payout.tutorId },
        data: { availableBalance: { increment: payout.amount } },
      });
      await tx.walletLedger.create({
        data: {
          tutorId: payout.tutorId,
          delta: payout.amount,
          reason: 'PAYOUT_REJECTED',
          payoutId: payout.id,
        },
      });
      this.mail
        .sendEmail(
          payout.tutor.user.email,
          'Payout rejected',
          `Your payout was rejected: ${reason}. Balance returned.`,
        )
        .catch(() => {});
      return updated;
    });
  }
}
