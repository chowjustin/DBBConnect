import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { PlatformBankService } from './platform-bank.service';
import {
  CreatePlatformBankDto,
  UpdatePlatformBankDto,
} from './dto/platform-bank.dto';

@Controller()
export class PlatformBankController {
  constructor(private readonly svc: PlatformBankService) {}

  @Get('payment-instructions')
  instructions() {
    return this.svc.listActive();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get('admin/platform-bank')
  listAll() {
    return this.svc.listAll();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post('admin/platform-bank')
  create(@Body() dto: CreatePlatformBankDto) {
    return this.svc.create(dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Patch('admin/platform-bank/:id')
  update(@Param('id') id: string, @Body() dto: UpdatePlatformBankDto) {
    return this.svc.update(id, dto);
  }
}
