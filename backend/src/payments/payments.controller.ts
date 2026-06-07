import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Request,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UserRole } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { EmailVerified } from '../auth/email-verified.decorator';
import { EmailVerifiedGuard } from '../auth/email-verified.guard';
import { IdempotencyInterceptor } from '../common/idempotency.interceptor';
import { multerStorage, materialFileFilter } from '../upload/multer.config';
import { PaymentsService } from './payments.service';
import { RejectPaymentDto, UploadProofDto } from './dto/upload-proof.dto';

@UseGuards(JwtAuthGuard, RolesGuard, EmailVerifiedGuard)
@Controller('payments')
export class PaymentsController {
  constructor(private readonly svc: PaymentsService) {}

  @EmailVerified()
  @Post('upload-proof')
  @UseInterceptors(IdempotencyInterceptor)
  @UseInterceptors(
    FileInterceptor('proofImage', {
      storage: multerStorage,
      fileFilter: materialFileFilter,
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  async uploadProof(
    @Request() req,
    @Body() dto: UploadProofDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) throw new BadRequestException('proofImage required');
    const proofUrl = `/uploads/payments/${file.filename}`;
    return this.svc.uploadProof(
      req.user.sub,
      dto.kind,
      dto.refId,
      dto.method,
      proofUrl,
      dto.promoCode,
    );
  }

  @Get('mine')
  mine(@Request() req) {
    return this.svc.listMine(req.user.sub);
  }
}

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin/payments')
export class AdminPaymentsController {
  constructor(private readonly svc: PaymentsService) {}

  @Roles(UserRole.ADMIN)
  @Get()
  listQueue() {
    return this.svc.listUnderReview();
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
