import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Materials E2E (No File Upload)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  let tutorProfileId: string;
  let studentProfileId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    prisma = moduleFixture.get(PrismaService);

    await app.init();

    // CLEAN DB ONLY FOR THIS FILE
    await prisma.materialAccess.deleteMany();
    await prisma.material.deleteMany();
    await prisma.studentProfile.deleteMany();
    await prisma.tutorProfile.deleteMany();
    await prisma.user.deleteMany();

    // CREATE UNIQUE USERS
    const tutorUser = await prisma.user.create({
      data: {
        email: 'tutor.materials@test.com',
        password: 'pass123',
        role: 'TUTOR',
        name: 'Tutor Materials',
        phoneNumber: '081234567890',
      },
    });

    const studentUser = await prisma.user.create({
      data: {
        email: 'student.materials@test.com',
        password: 'pass123',
        role: 'STUDENT',
        name: 'Student Materials',
        phoneNumber: '081234567891',
      },
    });

    const tutorProfile = await prisma.tutorProfile.create({
      data: { userId: tutorUser.id, bio: 'test tutor' },
    });

    const studentProfile = await prisma.studentProfile.create({
      data: { userId: studentUser.id },
    });

    tutorProfileId = tutorProfile.id;
    studentProfileId = studentProfile.id;
  });

  afterAll(async () => {
    await app.close();
  });

  // ----------------------------------------------------
  // 1. MANUALLY INSERT MATERIAL (no upload)
  // ----------------------------------------------------
  it('should create material manually for test', async () => {
    await prisma.material.create({
      data: {
        title: 'Dummy Material',
        fileUrl: 'dummy.pdf',
        tutorId: tutorProfileId,
        allowedStudents: {
          create: { studentId: studentProfileId },
        },
      },
    });

    const materials = await prisma.material.findMany();
    expect(materials.length).toBeGreaterThan(0);
  });

  // ----------------------------------------------------
  // 2. GET TUTOR MATERIALS
  // ----------------------------------------------------
  it('should return tutor materials', async () => {
    const res = await request(app.getHttpServer()).get(
      `/materials/tutor/${tutorProfileId}`,
    );

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  // ----------------------------------------------------
  // 3. GET STUDENT MATERIALS
  // ----------------------------------------------------
  it('should return materials allowed to student', async () => {
    const res = await request(app.getHttpServer()).get(
      `/materials/student/${studentProfileId}`,
    );

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });
});
