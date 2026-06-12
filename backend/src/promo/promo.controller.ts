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
} from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { PaginationQueryDto } from '../common/dto/pagination.dto';
import { PromoService } from './promo.service';
import {
  CreatePromoCodeDto,
  PreviewDiscountDto,
  SetPromoActiveDto,
} from './dto/promo.dto';

@Controller()
export class PromoController {
  constructor(private readonly svc: PromoService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get('admin/promo-codes')
  list(@Query() pagination: PaginationQueryDto) {
    return this.svc.list(pagination);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post('admin/promo-codes')
  create(@Request() req, @Body() dto: CreatePromoCodeDto) {
    return this.svc.create(req.user.sub, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Patch('admin/promo-codes/:id/active')
  setActive(@Param('id') id: string, @Body() dto: SetPromoActiveDto) {
    return this.svc.setActive(id, dto.active);
  }

  @UseGuards(JwtAuthGuard)
  @Post('payments/preview-discount')
  preview(@Body() dto: PreviewDiscountDto) {
    return this.svc.preview(dto.kind, dto.refId, dto.code);
  }
}
