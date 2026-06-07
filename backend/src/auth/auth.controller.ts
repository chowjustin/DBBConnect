import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  HttpCode,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import {
  VerifyEmailDto,
  ResendVerificationDto,
} from './dto/verify-email.dto';

@Throttle({ default: { ttl: 60_000, limit: 10 } })
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @HttpCode(200)
  @Post('refresh')
  refresh(@Body() dto: RefreshTokenDto) {
    return this.authService.refreshToken(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  logout(@Request() req: any) {
    return this.authService.logout(req.user.sub);
  }

  @Throttle({ default: { ttl: 3_600_000, limit: 5 } })
  @HttpCode(200)
  @Post('forgot')
  forgot(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto.email);
  }

  @HttpCode(200)
  @Post('reset')
  reset(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto.token, dto.newPassword);
  }

  @HttpCode(200)
  @Post('verify-email')
  verifyEmail(@Body() dto: VerifyEmailDto) {
    return this.authService.verifyEmail(dto.token);
  }

  @Throttle({ default: { ttl: 3_600_000, limit: 3 } })
  @HttpCode(200)
  @Post('resend-verification')
  resendVerification(@Body() dto: ResendVerificationDto) {
    return this.authService.resendVerification(dto.email);
  }
}
