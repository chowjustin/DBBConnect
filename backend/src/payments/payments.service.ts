import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PaymentKind, PaymentMethod, PaymentStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { PlatformBankService } from '../platform-bank/platform-bank.service';
import { PaginationQueryDto } from '../common/dto/pagination.dto';
import { paginatePrisma } from '../common/paginate';
import { ReferralsService } from '../referrals/referrals.service';

const COMMISSION_PCT = parseInt(
  process.env.PLATFORM_COMMISSION_PCT || '20',
  10,
);

@Injectable()
export class PaymentsService {
  constructor(
    private prisma: PrismaService,
    private mail: MailService,
    private platformBank: PlatformBankService,
    private referrals: ReferralsService,
  ) {}

  private snapshotBank(active: { bankName: string; accountNumber: string; accountHolder: string }[]) {
    if (active.length === 0) {
      throw new BadRequestException('No active platform bank configured');
    }
    const b = active[0];
    return `${b.bankName} ${b.accountNumber} ${b.accountHolder}`;
  }

  async uploadProof(
    payerId: string,
    kind: PaymentKind,
    refId: string,
    method: PaymentMethod,
    proofUrl: string,
    promoCode?: string,
  ) {
    // Resolve gross + payeeTutorId based on kind
    let grossAmount = 0;
    let payeeTutorId: string | null = null;
    let sessionAttendeeId: string | null = null;
    let subscriptionId: string | null = null;
    let featuredListingId: string | null = null;

    if (kind === PaymentKind.SESSION) {
      const attendee = await this.prisma.sessionAttendee.findUnique({
        where: { id: refId },
        include: { session: true },
      });
      if (!attendee) throw new NotFoundException('Attendee not found');
      if (attendee.paymentId) {
        throw new ConflictException('Already paid');
      }
      grossAmount = attendee.session.pricePerSeat;
      payeeTutorId = attendee.session.tutorId;
      sessionAttendeeId = attendee.id;
    } else if (kind === PaymentKind.SUBSCRIPTION) {
      // refId is plan tier — pricing table in env
      const tierPrices: Record<string, number> = {
        PREMIUM_STUDENT: parseInt(process.env.PRICE_PREMIUM_STUDENT || '50000', 10),
        PRO_TUTOR: parseInt(process.env.PRICE_PRO_TUTOR || '100000', 10),
      };
      if (!tierPrices[refId]) {
        throw new BadRequestException('Invalid tier');
      }
      grossAmount = tierPrices[refId];
      subscriptionId = refId;
    } else if (kind === PaymentKind.FEATURED_LISTING) {
      const days = parseInt(refId, 10);
      if (isNaN(days) || days <= 0) {
        throw new BadRequestException('Invalid days');
      }
      grossAmount = days * parseInt(process.env.FEATURED_PRICE_PER_DAY || '5000', 10);
      featuredListingId = refId;
    }

    // Promo (lookup, stack later)
    let discountAmount = 0;
    let promoCodeId: string | null = null;
    if (promoCode) {
      const code = await this.prisma.promoCode.findUnique({
        where: { code: promoCode },
      });
      if (!code) throw new BadRequestException('Invalid promo code');
      if (code.currentUses >= code.maxUses)
        throw new BadRequestException('Promo code exhausted');
      if (new Date() > code.validUntil)
        throw new BadRequestException('Promo code expired');
      if (!code.applicableKinds.includes(kind))
        throw new BadRequestException('Promo not applicable to this kind');
      if (code.minAmount && grossAmount < code.minAmount)
        throw new BadRequestException('Below minimum amount');
      discountAmount =
        code.discountType === 'PERCENT'
          ? Math.floor((grossAmount * code.discountValue) / 100)
          : code.discountValue;
      promoCodeId = code.id;
    }

    const netGross = Math.max(0, grossAmount - discountAmount);
    const commission = Math.floor((netGross * COMMISSION_PCT) / 100);
    const netAmount = netGross - commission;

    const banks = await this.platformBank.listActive();
    const receivedToBank = this.snapshotBank(banks);

    return this.prisma.$transaction(async (tx) => {
      const payment = await tx.payment.create({
        data: {
          kind,
          sessionAttendeeId,
          subscriptionId,
          featuredListingId,
          payerId,
          payeeTutorId,
          grossAmount,
          discountAmount,
          commission,
          netAmount,
          method,
          status: PaymentStatus.UNDER_REVIEW,
          proofUrl,
          receivedToBank,
          promoCodeId,
        },
      });
      if (promoCodeId) {
        await tx.promoCode.update({
          where: { id: promoCodeId },
          data: { currentUses: { increment: 1 } },
        });
      }
      return payment;
    });
  }

  async confirm(adminId: string, paymentId: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
    });
    if (!payment) throw new NotFoundException('Payment not found');
    if (payment.status !== PaymentStatus.UNDER_REVIEW) {
      throw new BadRequestException('Already reviewed');
    }
    return this.prisma.$transaction(async (tx) => {
      await tx.payment.update({
        where: { id: paymentId },
        data: {
          status: PaymentStatus.CONFIRMED,
          reviewedBy: adminId,
          reviewedAt: new Date(),
        },
      });
      if (payment.kind === PaymentKind.SESSION && payment.sessionAttendeeId) {
        await tx.sessionAttendee.update({
          where: { id: payment.sessionAttendeeId },
          data: { paymentId: payment.id },
        });
        if (payment.payeeTutorId) {
          await tx.tutorWallet.upsert({
            where: { tutorId: payment.payeeTutorId },
            update: {
              availableBalance: { increment: payment.netAmount },
              lifetimeEarned: { increment: payment.netAmount },
            },
            create: {
              tutorId: payment.payeeTutorId,
              availableBalance: payment.netAmount,
              lifetimeEarned: payment.netAmount,
            },
          });
          await tx.walletLedger.create({
            data: {
              tutorId: payment.payeeTutorId,
              delta: payment.netAmount,
              reason: 'PAYMENT_CONFIRMED',
              paymentId: payment.id,
            },
          });
        }
      } else if (payment.kind === PaymentKind.SUBSCRIPTION && payment.subscriptionId) {
        const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
        await tx.subscription.upsert({
          where: { userId: payment.payerId },
          update: { tier: payment.subscriptionId as any, expiresAt, startedAt: new Date() },
          create: {
            userId: payment.payerId,
            tier: payment.subscriptionId as any,
            expiresAt,
          },
        });
      } else if (payment.kind === PaymentKind.FEATURED_LISTING && payment.featuredListingId) {
        // payeeTutorId is the tutor being featured (set at create)
        const days = parseInt(payment.featuredListingId, 10);
        const activeUntil = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
        if (payment.payeeTutorId) {
          await tx.featuredListing.upsert({
            where: { tutorId: payment.payeeTutorId },
            update: { activeUntil },
            create: { tutorId: payment.payeeTutorId, activeUntil },
          });
        }
      }
      // referral reward (only on SESSION CONFIRMED)
      if (payment.kind === PaymentKind.SESSION) {
        await this.referrals
          .maybeCreateRewardOnFirstSession(payment.id, payment.payerId)
          .catch((e) => console.error('referral reward error', e));
      }
      return tx.payment.findUnique({ where: { id: paymentId } });
    });
  }

  async reject(adminId: string, paymentId: string, notes: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
    });
    if (!payment) throw new NotFoundException('Payment not found');
    if (payment.status !== PaymentStatus.UNDER_REVIEW) {
      throw new BadRequestException('Already reviewed');
    }
    return this.prisma.payment.update({
      where: { id: paymentId },
      data: {
        status: PaymentStatus.REJECTED,
        reviewedBy: adminId,
        reviewedAt: new Date(),
        notes,
      },
    });
  }

  listUnderReview(pagination: PaginationQueryDto) {
    return paginatePrisma(this.prisma.payment, pagination, {
      where: { status: PaymentStatus.UNDER_REVIEW },
      orderBy: { createdAt: 'asc' },
    });
  }

  listHistory(pagination: PaginationQueryDto) {
    return paginatePrisma(this.prisma.payment, pagination, {
      where: {
        status: {
          in: [
            PaymentStatus.CONFIRMED,
            PaymentStatus.REJECTED,
            PaymentStatus.REFUNDED,
          ],
        },
      },
      orderBy: { reviewedAt: 'desc' },
    });
  }

  listMine(payerId: string, pagination: PaginationQueryDto) {
    return paginatePrisma(this.prisma.payment, pagination, {
      where: { payerId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
