import { Test, TestingModule } from '@nestjs/testing';
import { StudentsService } from './students.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';
import { Subject } from '@prisma/client';

describe('StudentsService', () => {
  let service: StudentsService;
  let prisma: PrismaService;

  const mockPrisma = {
    user: {
      findUnique: jest.fn(),
    },
    tutorProfile: {
      findMany: jest.fn(),
    },
    studentProfile: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StudentsService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<StudentsService>(StudentsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getProfile', () => {
    it('should return student profile if found', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 's1',
        name: 'John',
        email: 'john@test.com',
        phoneNumber: '123',
        role: 'STUDENT',
        studentProfile: { bio: 'bio', tutors: [], applications: [] },
      });

      const result = await service.getProfile('john@test.com');
      expect(result.user.name).toBe('John');
      expect(result.profile.bio).toBe('bio');
    });

    it('should throw NotFoundException if student not found', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      await expect(service.getProfile('noone@test.com')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('search', () => {
    it('should call prisma.tutorProfile.findMany with filters', async () => {
      mockPrisma.tutorProfile.findMany.mockResolvedValue([{ id: 't1', user: {} }]);
      const result = await service.search('Alice', Subject.MATH, 50, 200, true, 'me@test.com');

      expect(mockPrisma.tutorProfile.findMany).toHaveBeenCalledWith({
        where: {
          AND: [
            { user: { name: { contains: 'Alice', mode: 'insensitive' } } },
            { subjects: { has: Subject.MATH } },
            { hourlyRate: { gte: 50, lte: 200 } },
            { user: { email: { not: 'me@test.com' } } },
          ],
        },
        include: { user: true },
      });

      expect(result).toEqual([{ id: 't1', user: {} }]);
    });
  });

  describe('update', () => {
    it('should update student profile successfully', async () => {
      mockPrisma.studentProfile.findUnique.mockResolvedValue({ id: 's1' });
      mockPrisma.studentProfile.update.mockResolvedValue({ id: 's1', bio: 'new bio', user: {} });

      const result = await service.update('s1', { bio: 'new bio', school: 'ABC', interests: ['MATH'] });
      expect(result.bio).toBe('new bio');
    });

    it('should throw NotFoundException if student not found', async () => {
      mockPrisma.studentProfile.findUnique.mockResolvedValue(null);
      await expect(service.update('s2', { bio: '', school: '', interests: [] })).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
