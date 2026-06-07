import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreatePlatformBankDto,
  UpdatePlatformBankDto,
} from './dto/platform-bank.dto';

@Injectable()
export class PlatformBankService {
  constructor(private prisma: PrismaService) {}

  listAll() {
    return this.prisma.platformBankAccount.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  listActive() {
    return this.prisma.platformBankAccount.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'asc' },
    });
  }

  create(dto: CreatePlatformBankDto) {
    return this.prisma.platformBankAccount.create({ data: dto });
  }

  async update(id: string, dto: UpdatePlatformBankDto) {
    const exists = await this.prisma.platformBankAccount.findUnique({
      where: { id },
    });
    if (!exists) throw new NotFoundException('Bank not found');
    return this.prisma.platformBankAccount.update({
      where: { id },
      data: dto,
    });
  }
}
