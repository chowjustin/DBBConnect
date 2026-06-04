import { Test, TestingModule } from '@nestjs/testing';
import { TutorsService } from './tutors.service';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { Subject } from '@prisma/client';
import { UpdateTutorDto } from './dto/update-tutor.dto';

describe('TutorsService', () => {
  let service: TutorsService;
  let prisma: PrismaService;

  const mockPrisma = {
    user: {
      findUnique: jest.fn(),
    },
    tutorProfile: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    application: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  };

  const mockMailService = {
    sendMail: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TutorsService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: MailService, useValue: mockMailService },
      ],
    }).compile();

    service = module.get<TutorsService>(TutorsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('search', () => {
    it('should return tutors based on filters', async () => {
      mockPrisma.tutorProfile.findMany.mockResolvedValue([{ id: 't1', user: {} }]);

      const result = await service.search('Alice', Subject.MATH, 50, 200, true, 'student@test.com');

      expect(mockPrisma.tutorProfile.findMany).toHaveBeenCalled();
      expect(result).toEqual([{ id: 't1', user: {} }]);
    });
  });

  describe('getProfile', () => {
    it('should return tutor profile if found', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 't1',
        name: 'Alice',
        email: 'alice@test.com',
        phoneNumber: '123',
        role: 'TUTOR',
        tutorProfile: { bio: 'bio', students: [], applications: [] },
      });

      const result = await service.getProfile('alice@test.com');

      expect(result.user.name).toBe('Alice');
      expect(result.profile.bio).toBe('bio');
    });

    it('should throw NotFoundException if tutor not found', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      await expect(service.getProfile('noone@test.com')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update tutor profile successfully', async () => {
      mockPrisma.tutorProfile.findUnique.mockResolvedValue({ id: 't1' });
      mockPrisma.tutorProfile.update.mockResolvedValue({ id: 't1', bio: 'updated', availability: ['Monday 10:00'], subjects: [Subject.MATH] });

      const dto: UpdateTutorDto = {
        bio: 'updated',
        hourlyRate: 50,
        availability: { 'Monday': ['10:00'] },
        subjects: [Subject.MATH],
      };

      const result = await service.update('t1', dto);
      expect(result.bio).toBe('updated');
      expect(mockPrisma.tutorProfile.update).toHaveBeenCalledWith({
        where: { id: 't1' },
        data: dto,
      });
    });

    it('should throw NotFoundException if tutor not found', async () => {
      mockPrisma.tutorProfile.findUnique.mockResolvedValue(null);

      const dto: UpdateTutorDto = {
        bio: '',
        hourlyRate: 0,
        availability: {},
        subjects: [],
      };

      await expect(service.update('t2', dto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('listAllStudents', () => {
    it('should return all connected students', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        tutorProfile: {
          students: [
            { id: 's1', user: { name: 'Student1', email: 's1@test.com', phoneNumber: '111', role: 'STUDENT' } },
          ],
        },
      });

      const result = await service.listAllStudents('tutor@test.com');
      expect(result).toEqual([
        { id: 's1', name: 'Student1', email: 's1@test.com', phoneNumber: '111', role: 'STUDENT' },
      ]);
    });

    it('should throw NotFoundException if tutor profile not found', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      await expect(service.listAllStudents('notfound@test.com')).rejects.toThrow(NotFoundException);
    });
  });

  describe('removeStudent', () => {
    it('should remove student successfully', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        tutorProfile: { id: 't1', students: [{ id: 's1' }] },
      });
      mockPrisma.tutorProfile.update.mockResolvedValue({});

      const result = await service.removeStudent('tutor@test.com', 's1');
      expect(result).toEqual({ message: 'Student removed successfully' });
      expect(mockPrisma.tutorProfile.update).toHaveBeenCalled();
    });

    it('should throw ForbiddenException if student not assigned', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        tutorProfile: { id: 't1', students: [] },
      });

      await expect(service.removeStudent('tutor@test.com', 's1')).rejects.toThrow(ForbiddenException);
    });
  });
});
// import { Test, TestingModule } from '@nestjs/testing';
// import { TutorsService } from './tutors.service';
// import { PrismaService } from '../prisma/prisma.service';
// import { MailService } from '../mail/mail.service';
// import { NotFoundException, ForbiddenException } from '@nestjs/common';
// import { Subject } from '@prisma/client';

// describe('TutorsService', () => {
//   let service: TutorsService;
//   const mockPrisma = {
//     user: {
//       findUnique: jest.fn(),
//     },
//     tutorProfile: {
//       findUnique: jest.fn(),
//       update: jest.fn(),
//       findMany: jest.fn(),
//     },
//     application: {
//       findUnique: jest.fn(),
//       findMany: jest.fn(),
//       update: jest.fn(),
//     },
//   };
//   const mockMailService = { sendEmail: jest.fn() };

//   beforeEach(async () => {
//     const module: TestingModule = await Test.createTestingModule({
//       providers: [
//         TutorsService,
//         { provide: PrismaService, useValue: mockPrisma },
//         { provide: MailService, useValue: mockMailService },
//       ],
//     }).compile();

//     service = module.get<TutorsService>(TutorsService);
//     jest.clearAllMocks();
//   });

//   describe('removeStudent', () => {
//     it('should remove a student successfully', async () => {
//       mockPrisma.user.findUnique.mockResolvedValue({
//         email: 'tutor@test.com',
//         tutorProfile: { id: 't1', students: [{ id: 's1' }] },
//       });
//       mockPrisma.tutorProfile.update.mockResolvedValue({});

//       const result = await service.removeStudent('tutor@test.com', 's1');
//       expect(result).toEqual({ message: 'Student removed successfully' });
//       expect(mockPrisma.tutorProfile.update).toHaveBeenCalled();
//     });

//     it('should throw ForbiddenException if student not assigned', async () => {
//       mockPrisma.user.findUnique.mockResolvedValue({
//         email: 'tutor@test.com',
//         tutorProfile: { id: 't1', students: [] },
//       });

//       await expect(
//         service.removeStudent('tutor@test.com', 's1')
//       ).rejects.toThrow(ForbiddenException);
//     });

//     it('should throw NotFoundException if tutor not found', async () => {
//       mockPrisma.user.findUnique.mockResolvedValue(null);
//       await expect(
//         service.removeStudent('tutor@test.com', 's1')
//       ).rejects.toThrow(NotFoundException);
//     });
//   });

//   describe('acceptApplication', () => {
//     it('should accept application successfully', async () => {
//       mockPrisma.user.findUnique.mockResolvedValue({ tutorProfile: { id: 't1' } });
//       mockPrisma.application.findUnique.mockResolvedValue({ id: 'app1', tutorId: 't1', studentId: 's1' });
//       mockPrisma.application.update.mockResolvedValue({});
//       mockPrisma.tutorProfile.update.mockResolvedValue({});

//       const result = await service.acceptApplication('tutor@test.com', 'app1');
//       expect(result).toEqual({ message: 'Application accepted successfully' });
//     });

//     it('should throw NotFoundException if application not found', async () => {
//       mockPrisma.user.findUnique.mockResolvedValue({ tutorProfile: { id: 't1' } });
//       mockPrisma.application.findUnique.mockResolvedValue(null);

//       await expect(service.acceptApplication('tutor@test.com', 'app1')).rejects.toThrow(NotFoundException);
//     });

//     it('should throw ForbiddenException if tutor does not own application', async () => {
//       mockPrisma.user.findUnique.mockResolvedValue({ tutorProfile: { id: 't1' } });
//       mockPrisma.application.findUnique.mockResolvedValue({ id: 'app1', tutorId: 'other', studentId: 's1' });

//       await expect(service.acceptApplication('tutor@test.com', 'app1')).rejects.toThrow(ForbiddenException);
//     });
//   });

//   describe('search', () => {
//     it('should return filtered tutors', async () => {
//       mockPrisma.tutorProfile.findMany.mockResolvedValue([{ id: 't1', user: {} }]);
//       const result = await service.search('Alice', Subject.MATH, 50, 200, true, 'student@test.com');
//       expect(result).toEqual([{ id: 't1', user: {} }]);
//     });
//   });
// });
