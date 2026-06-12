import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
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
import { PaymentsService } from './payments.service';
import { RejectPaymentDto, UploadProofDto } from './dto/upload-proof.dto';

@UseGuards(JwtAuthGuard, RolesGuard, EmailVerifiedGuard)
@Controller('payments')
export class PaymentsController {
  constructor(private readonly svc: PaymentsService) {}

  @EmailVerified()
  @Post('upload-proof')
  @UseInterceptors(IdempotencyInterceptor)
  async uploadProof(@Request() req, @Body() dto: UploadProofDto) {
    return this.svc.uploadProof(
      req.user.sub,
      dto.kind,
      dto.refId,
      dto.method,
      dto.proofUrl,
      dto.promoCode,
    );
  }

  @Get('mine')
  mine(@Request() req, @Query() pagination: PaginationQueryDto) {
    return this.svc.listMine(req.user.sub, pagination);
  }
}

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin/payments')
export class AdminPaymentsController {
  constructor(private readonly svc: PaymentsService) {}

  @Roles(UserRole.ADMIN)
  @Get()
  listQueue(@Query() pagination: PaginationQueryDto) {
    return this.svc.listUnderReview(pagination);
  }

  @Roles(UserRole.ADMIN)
  @Patch(':id/confirm')
  confirm(@Request() req, @Param('id') id: string) {
    return this.svc.confirm(req.user.sub, id);
  }

  @Roles(UserRole.ADMIN)
  @Patch(':id/reject')
  reject(
    @Request() req,
    @Param('id') id: string,
    @Body() dto: RejectPaymentDto,
  ) {
    return this.svc.reject(req.user.sub, id, dto.notes);
  }
}
