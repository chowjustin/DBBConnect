import { Test, TestingModule } from '@nestjs/testing';
import { ApplicationsService } from './applications.service';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { ApplicationStatus } from '@prisma/client';
import { NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';

describe('ApplicationsService', () => {
  let service: ApplicationsService;
  let prisma: PrismaService;
  let mail: MailService;

  const mockPrisma = {
    user: { findUnique: jest.fn() },
    studentProfile: { findUnique: jest.fn() },
    tutorProfile: { findUnique: jest.fn(), update: jest.fn() },
    application: { findFirst: jest.fn(), create: jest.fn(), findMany: jest.fn(), findUnique: jest.fn(), update: jest.fn(), delete: jest.fn() },
  };

  const mockMail = {
    sendStudentPendingEmail: jest.fn(),
    sendTutorNewApplicationEmail: jest.fn(),
    sendStudentStatusUpdateEmail: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApplicationsService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: MailService, useValue: mockMail },
      ],
    }).compile();

    service = module.get<ApplicationsService>(ApplicationsService);
    prisma = module.get<PrismaService>(PrismaService);
    mail = module.get<MailService>(MailService);

    jest.clearAllMocks();
  });

  describe('apply', () => {
    it('should create a new application', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ id: 's1', name: 'John', email: 'student@test.com', studentProfile: { id: 'sp1' } });
      mockPrisma.tutorProfile.findUnique.mockResolvedValue({ id: 't1', user: { email: 'tutor@test.com', name: 'Tutor John' } });
      mockPrisma.application.findFirst.mockResolvedValue(null);
      mockPrisma.application.create.mockResolvedValue({ id: 'app1' });

      const result = await service.apply('student@test.com', 't1');
      expect(result).toEqual({ id: 'app1' });
      expect(mail.sendStudentPendingEmail).toHaveBeenCalled();
      expect(mail.sendTutorNewApplicationEmail).toHaveBeenCalled();
    });

    it('should throw if student not found', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      await expect(service.apply('noone@test.com', 't1')).rejects.toThrow(NotFoundException);
    });

    it('should throw if tutor not found', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ id: 's1', studentProfile: { id: 'sp1' }, email: 's@test.com', name: 'S' });
      mockPrisma.tutorProfile.findUnique.mockResolvedValue(null);
      await expect(service.apply('s@test.com', 't2')).rejects.toThrow(NotFoundException);
    });

    it('should throw if already has pending application', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ id: 's1', studentProfile: { id: 'sp1' }, email: 's@test.com', name: 'S' });
      mockPrisma.tutorProfile.findUnique.mockResolvedValue({ id: 't1', user: { email: 't@test.com', name: 'T' } });
      mockPrisma.application.findFirst.mockResolvedValue({ id: 'app1' });
      await expect(service.apply('s@test.com', 't1')).rejects.toThrow(BadRequestException);
    });
  });

  describe('cancel', () => {
    it('should delete pending application', async () => {
      mockPrisma.application.findUnique.mockResolvedValue({
        id: 'app1',
        student: { user: { email: 'student@test.com' } },
        status: ApplicationStatus.PENDING,
      });
      mockPrisma.application.delete.mockResolvedValue({ id: 'app1' });

      const result = await service.cancel('student@test.com', 'app1');
      expect(result).toEqual({ id: 'app1' });
    });

    it('should throw if not pending', async () => {
      mockPrisma.application.findUnique.mockResolvedValue({
        id: 'app1',
        student: { user: { email: 'student@test.com' } },
        status: ApplicationStatus.ACCEPTED,
      });
      await expect(service.cancel('student@test.com', 'app1')).rejects.toThrow(ForbiddenException);
    });
  });

  describe('listForStudent', () => {
    it('should return applications for student', async () => {
      mockPrisma.application.findMany.mockResolvedValue([{ id: 'app1' }]);
      const result = await service.listForStudent('student@test.com');
      expect(result).toEqual([{ id: 'app1' }]);
    });
  });

  describe('listForTutor', () => {
    it('should return applications for tutor', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ id: 't1' });
      mockPrisma.tutorProfile.findUnique.mockResolvedValue({ id: 'tp1' });
      mockPrisma.application.findMany.mockResolvedValue([{ id: 'app1' }]);
      const result = await service.listForTutor('tutor@test.com');
      expect(result).toEqual([{ id: 'app1' }]);
    });
  });

  describe('updateStatus', () => {
    it('should accept application and connect student', async () => {
      mockPrisma.application.findUnique.mockResolvedValue({
        id: 'app1',
        tutor: { id: 'tp1', user: { email: 'tutor@test.com', name: 'T' }, students: [] },
        student: { id: 's1', user: { email: 'student@test.com' } },
        status: ApplicationStatus.PENDING,
      });
      mockPrisma.application.update.mockResolvedValue({ id: 'app1', status: ApplicationStatus.ACCEPTED });
      mockPrisma.tutorProfile.update.mockResolvedValue({});
      const result = await service.updateStatus('tutor@test.com', 'app1', ApplicationStatus.ACCEPTED);
      expect(result.status).toBe(ApplicationStatus.ACCEPTED);
      expect(mail.sendStudentStatusUpdateEmail).toHaveBeenCalled();
    });

    it('should throw if not tutor', async () => {
      mockPrisma.application.findUnique.mockResolvedValue({
        id: 'app1',
        tutor: { user: { email: 'other@test.com' }, students: [] },
        student: { id: 's1', user: { email: 'student@test.com' } },
        status: ApplicationStatus.PENDING,
      });
      await expect(service.updateStatus('tutor@test.com', 'app1', ApplicationStatus.ACCEPTED)).rejects.toThrow(ForbiddenException);
    });
  });
});
