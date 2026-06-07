import { Body, Controller, Param, Post, UseGuards } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { AuthService } from '../auth/auth.service';
import { InviteAdminDto } from './dto/invite-admin.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin/users')
export class AdminUsersController {
  constructor(private readonly authService: AuthService) {}

  @Roles(UserRole.ADMIN)
  @Post('invite')
  invite(@Body() dto: InviteAdminDto) {
    return this.authService.createAdmin(dto);
  }

  @Roles(UserRole.ADMIN)
  @Post(':id/verify-email')
  markVerified(@Param('id') id: string) {
    return this.authService.adminMarkVerified(id);
  }
}
