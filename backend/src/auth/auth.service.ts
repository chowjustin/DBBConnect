import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { BadRequestException, ConflictException } from '@nestjs/common';
import { Prisma } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  private generateTokens(email: string, role: string) {
    const payload = { sub: email, email, role };
    const accessToken = this.jwtService.sign(payload, { expiresIn: '15m' });

    const refreshPayload = {
      ...payload,
      jti: `${email}-${Date.now()}-${Math.random()}`,
    };
    const refreshToken = this.jwtService.sign(refreshPayload, {
      expiresIn: '7d',
    });

    return { accessToken, refreshToken };
  }

  private async updateRefreshToken(email: string, refreshToken: string) {
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    await this.prisma.user.update({
      where: { email },
      data: { refreshToken: hashedRefreshToken },
    });
  }

  async register(registerDto: RegisterDto) {
    const { name, email, password, role, phoneNumber } = registerDto;

    // Validate required fields
    if (!name || !email || !password || !role || !phoneNumber) {
      throw new BadRequestException('All fields are required');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    try {
      // Create the user
      const user = await this.prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role,
          phoneNumber,
        },
      });

      let profileId: string; // will store the created profile's ID

      // Automatically create a profile based on role
      if (role === 'TUTOR') {
        const tutorProfile = await this.prisma.tutorProfile.create({
          data: {
            userId: user.id,
            bio: '',
            subjects: [],
            experience: 0,
            availability: [],
            hourlyRate: 0,
          },
        });
        profileId = tutorProfile.id;
      } else if (role === 'STUDENT') {
        const studentProfile = await this.prisma.studentProfile.create({
          data: {
            userId: user.id,
            bio: '',
            interests: [],
          },
        });
        profileId = studentProfile.id;
      }
      else{
        throw new BadRequestException('Invalid user role');
      }

      // Generate tokens
      const { accessToken, refreshToken } = this.generateTokens(user.email, user.role);
      await this.updateRefreshToken(user.email, refreshToken);

      // Return user info + profileId
      return {
        access_token: accessToken,
        refresh_token: refreshToken,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          profileId, 
        },
      };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException('Email or phone number already exists');
      }
      throw new BadRequestException('Failed to register user');
    }
  }


  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    if (!email || !password) {
      throw new BadRequestException('Email and password are required');
    }

    const user = await this.prisma.user.findUnique({ where: { email } });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const { accessToken, refreshToken } = this.generateTokens(user.email, user.role);
    await this.updateRefreshToken(user.email, refreshToken);

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      user: {
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
  }


  async refreshToken(refreshTokenDto: RefreshTokenDto) {
    const { refreshToken } = refreshTokenDto;

    try {
      const payload = this.jwtService.verify(refreshToken) as {
        email: string;
        sub: string;
        role: string;
        jti: string;
      };

      const user = await this.prisma.user.findUnique({
        where: { email: payload.email },
      });

      if (!user || !user.refreshToken) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const refreshTokenMatches = await bcrypt.compare(
        refreshToken,
        user.refreshToken,
      );

      if (!refreshTokenMatches) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const { accessToken, refreshToken: newRefreshToken } =
        this.generateTokens(user.email, user.role);
      await this.updateRefreshToken(user.email, newRefreshToken);

      return {
        access_token: accessToken,
        refresh_token: newRefreshToken,
      };
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async logout(email: string) {
    await this.prisma.user.update({
      where: { email },
      data: { refreshToken: null },
    });

    return { message: 'Logged out successfully' };
  }
}
