import { Test, TestingModule } from '@nestjs/testing';
import { ApplicationsController } from './applications.controller';
import { ApplicationsService } from './applications.service';
import { ApplicationStatus } from '@prisma/client';

describe('ApplicationsController', () => {
  let controller: ApplicationsController;
  let service: ApplicationsService;

  const mockService = {
    apply: jest.fn(),
    cancel: jest.fn(),
    listForStudent: jest.fn(),
    listForTutor: jest.fn(),
    updateStatus: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ApplicationsController],
      providers: [{ provide: ApplicationsService, useValue: mockService }],
    }).compile();

    controller = module.get<ApplicationsController>(ApplicationsController);
    service = module.get<ApplicationsService>(ApplicationsService);
    jest.clearAllMocks();
  });

  it('should apply', async () => {
    mockService.apply.mockResolvedValue({ id: 'app1' });
    const req = { user: { email: 'student@test.com' } };
    const dto = { tutorId: 't1' };
    const result = await controller.apply(req, dto);
    expect(result).toEqual({ id: 'app1' });
    expect(mockService.apply).toHaveBeenCalledWith('student@test.com', 't1');
  });

  it('should cancel', async () => {
    mockService.cancel.mockResolvedValue({ id: 'app1' });
    const req = { user: { email: 'student@test.com' } };
    const result = await controller.cancel(req, 'app1');
    expect(result).toEqual({ id: 'app1' });
    expect(mockService.cancel).toHaveBeenCalledWith('student@test.com', 'app1');
  });

  it('should listForStudent', async () => {
    mockService.listForStudent.mockResolvedValue([{ id: 'app1' }]);
    const req = { user: { email: 'student@test.com' } };
    const result = await controller.listForStudent(req);
    expect(result).toEqual([{ id: 'app1' }]);
    expect(mockService.listForStudent).toHaveBeenCalledWith('student@test.com');
  });

  it('should listForTutor', async () => {
    mockService.listForTutor.mockResolvedValue([{ id: 'app1' }]);
    const req = { user: { email: 'tutor@test.com' } };
    const result = await controller.listForTutor(req);
    expect(result).toEqual([{ id: 'app1' }]);
    expect(mockService.listForTutor).toHaveBeenCalledWith('tutor@test.com');
  });

  it('should updateStatus', async () => {
    mockService.updateStatus.mockResolvedValue({ id: 'app1', status: ApplicationStatus.ACCEPTED });
    const req = { user: { email: 'tutor@test.com' } };
    const dto = { status: ApplicationStatus.ACCEPTED };
    const result = await controller.updateStatus(req, 'app1', dto);
    expect(result).toEqual({ id: 'app1', status: ApplicationStatus.ACCEPTED });
    expect(mockService.updateStatus).toHaveBeenCalledWith('tutor@test.com', 'app1', ApplicationStatus.ACCEPTED);
  });
});
