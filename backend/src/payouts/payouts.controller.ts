import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Request,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { EmailVerified } from '../auth/email-verified.decorator';
import { EmailVerifiedGuard } from '../auth/email-verified.guard';
import { IdempotencyInterceptor } from '../common/idempotency.interceptor';
import { PaginationQueryDto } from '../common/dto/pagination.dto';
import { PayoutsService } from './payouts.service';
import {
  MarkPaidPayoutDto,
  RejectPayoutDto,
  RequestPayoutDto,
} from './dto/payout.dto';

@UseGuards(JwtAuthGuard, RolesGuard, EmailVerifiedGuard)
@Controller('tutor')
export class TutorPayoutsController {
  constructor(private readonly svc: PayoutsService) {}

  @Roles(UserRole.TUTOR)
  @Get('wallet')
  wallet(@Request() req) {
    return this.svc.getWallet(req.user.email);
  }

  @EmailVerified()
  @Roles(UserRole.TUTOR)
  @Post('payouts')
  @UseInterceptors(IdempotencyInterceptor)
  request(@Request() req, @Body() dto: RequestPayoutDto) {
    return this.svc.request(req.user.email, dto.amount);
  }

  @Roles(UserRole.TUTOR)
  @Get('payouts')
  listMine(@Request() req, @Query() pagination: PaginationQueryDto) {
    return this.svc.listMine(req.user.email, pagination);
  }
}

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin/payouts')
export class AdminPayoutsController {
  constructor(private readonly svc: PayoutsService) {}

  @Roles(UserRole.ADMIN)
  @Get()
  queue(@Query() pagination: PaginationQueryDto) {
    return this.svc.listQueue(pagination);
  }

  @Roles(UserRole.ADMIN)
  @Get('history')
  history(@Query() pagination: PaginationQueryDto) {
    return this.svc.listHistory(pagination);
  }

  @Roles(UserRole.ADMIN)
  @Post(':id/mark-paid')
  async markPaid(
    @Request() req,
    @Param('id') id: string,
    @Body() dto: MarkPaidPayoutDto,
  ) {
    return this.svc.markPaid(req.user.sub, id, dto.proofUrl);
  }

  @Roles(UserRole.ADMIN)
  @Post(':id/reject')
  reject(
    @Request() req,
    @Param('id') id: string,
    @Body() dto: RejectPayoutDto,
  ) {
    return this.svc.reject(req.user.sub, id, dto.reason);
  }
}
