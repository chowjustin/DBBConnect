import { Test, TestingModule } from '@nestjs/testing';
import { TutorsController } from './tutors.controller';
import { TutorsService } from './tutors.service';
import { UpdateTutorDto } from './dto/update-tutor.dto';
import { Subject } from '@prisma/client';
import { NotFoundException, ForbiddenException } from '@nestjs/common';

describe('TutorsController', () => {
  let controller: TutorsController;
  let service: TutorsService;

  const mockService = {
    search: jest.fn(),
    getProfile: jest.fn(),
    update: jest.fn(),
    listAllStudents: jest.fn(),
    removeStudent: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TutorsController],
      providers: [{ provide: TutorsService, useValue: mockService }],
    }).compile();

    controller = module.get<TutorsController>(TutorsController);
    service = module.get<TutorsService>(TutorsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('searchTutorsForStudent', () => {
    it('should call service.search with correct params', async () => {
      const mockTutors = [{ id: 't1', user: {} }];
      mockService.search.mockResolvedValue(mockTutors);

      const req = { user: { email: 'student@test.com' } };
      const result = await controller.searchTutorsForStudent('Alice', 'MATH', '50', '200', req);

      expect(result).toBe(mockTutors);
      expect(mockService.search).toHaveBeenCalledWith(
        'Alice',
        Subject.MATH,
        50,
        200,
        true,
        'student@test.com'
      );
    });

    it('should handle invalid subject', async () => {
      const mockTutors: any[] = [];
      mockService.search.mockResolvedValue(mockTutors);

      const req = { user: { email: 'student@test.com' } };
      await controller.searchTutorsForStudent('Alice', 'INVALID', '50', '200', req);

      expect(mockService.search).toHaveBeenCalledWith(
        'Alice',
        undefined,
        50,
        200,
        true,
        'student@test.com'
      );
    });
  });

  describe('getMyProfile', () => {
    it('should return tutor profile', async () => {
      const mockProfile = { user: { email: 'tutor@test.com' }, profile: {} };
      mockService.getProfile.mockResolvedValue(mockProfile);

      const req = { user: { email: 'tutor@test.com' } };
      const result = await controller.getMyProfile(req);

      expect(result).toBe(mockProfile);
      expect(mockService.getProfile).toHaveBeenCalledWith('tutor@test.com');
    });

    it('should throw if tutor not found', async () => {
      mockService.getProfile.mockRejectedValue(new NotFoundException());
      const req = { user: { email: 'noone@test.com' } };

      await expect(controller.getMyProfile(req)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update tutor profile', async () => {
      const dto: UpdateTutorDto = {
        bio: 'updated',
        hourlyRate: 50,
        subjects: [Subject.MATH],
        availability: { Monday: ['10:00'] },
      };
      const mockUpdate = { id: 't1', ...dto };
      mockService.update.mockResolvedValue(mockUpdate);

      const result = await controller.update('t1', dto);
      expect(result).toBe(mockUpdate);
      expect(mockService.update).toHaveBeenCalledWith('t1', dto);
    });
  });

  describe('listAllStudents', () => {
    it('should return all students of the tutor', async () => {
      const mockStudents = [{ id: 's1', name: 'Student 1', email: 's1@test.com' }];
      mockService.listAllStudents.mockResolvedValue(mockStudents);

      const result = await controller.listAllStudents('tutor@test.com');
      expect(result).toBe(mockStudents);
      expect(mockService.listAllStudents).toHaveBeenCalledWith('tutor@test.com');
    });
  });

  describe('removeStudent', () => {
    it('should remove student successfully', async () => {
      const req = { user: { email: 'tutor@test.com' } };
      mockService.removeStudent.mockResolvedValue({ message: 'Student removed successfully' });

      const result = await controller.removeStudent('s1', req);
      expect(result).toEqual({ message: 'Student removed successfully' });
      expect(mockService.removeStudent).toHaveBeenCalledWith('tutor@test.com', 's1');
    });

    it('should throw if student cannot be removed', async () => {
      const req = { user: { email: 'tutor@test.com' } };
      mockService.removeStudent.mockRejectedValue(new ForbiddenException());

      await expect(controller.removeStudent('s1', req)).rejects.toThrow(ForbiddenException);
    });
  });
});
