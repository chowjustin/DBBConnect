import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('E2E – Tutorify App (Unified Flow)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  let studentToken: string;
  let tutorToken: string;

  let studentProfileId: string;
  let tutorProfileId: string;

  let applicationId: string;
  let reviewId: string;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = module.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

    prisma = module.get(PrismaService);

    await app.init();
    await prisma.$connect();

    // CLEAN DB FOR THIS FILE ONLY
    await prisma.review.deleteMany();
    await prisma.application.deleteMany();
    await prisma.studentProfile.deleteMany();
    await prisma.tutorProfile.deleteMany();
    await prisma.user.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await app.close();
  });

  // ----------------------------------------------------
  // 1. REGISTER STUDENT
  // ----------------------------------------------------
  it('should register a student', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        name: 'Student One',
        email: 'student.app@test.com',   // unique
        password: '123456',
        role: 'STUDENT',
        phoneNumber: '123456',
      })
      .expect(201);

    studentToken = res.body.access_token;
    studentProfileId = res.body.user.profileId;

    expect(studentToken).toBeDefined();
    expect(studentProfileId).toBeDefined();
  });

  // ----------------------------------------------------
  // 2. REGISTER TUTOR
  // ----------------------------------------------------
  it('should register a tutor', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        name: 'Tutor One',
        email: 'tutor.app@test.com',   // unique
        password: '123456',
        role: 'TUTOR',
        phoneNumber: '998877',
      })
      .expect(201);

    tutorToken = res.body.access_token;
    tutorProfileId = res.body.user.profileId;

    expect(tutorToken).toBeDefined();
    expect(tutorProfileId).toBeDefined();
  });

  // ----------------------------------------------------
  // 3. SEARCH TUTORS
  // ----------------------------------------------------
  it('should allow student to search tutors', async () => {
    const res = await request(app.getHttpServer())
      .get('/students/search-tutors')
      .set('Authorization', `Bearer ${studentToken}`)
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
  });

  // ----------------------------------------------------
  // 4. APPLY TO TUTOR
  // ----------------------------------------------------
  it('should allow student to apply to tutor', async () => {
    const res = await request(app.getHttpServer())
      .post('/applications')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({ tutorId: tutorProfileId })
      .expect(201);

    applicationId = res.body.id;
    expect(res.body.status).toBe('PENDING');
  });

  // ----------------------------------------------------
  // 5. ACCEPT APPLICATION
  // ----------------------------------------------------
  it('should allow tutor to accept application', async () => {
    const res = await request(app.getHttpServer())
      .patch(`/applications/${applicationId}/status`)
      .set('Authorization', `Bearer ${tutorToken}`)
      .send({ status: 'ACCEPTED' })
      .expect(200);

    expect(res.body.status).toBe('ACCEPTED');
  });

  // ----------------------------------------------------
  // 6. REVIEW: CREATE
  // ----------------------------------------------------
  it('should allow student to create a review', async () => {
    const res = await request(app.getHttpServer())
      .post(`/reviews/${tutorProfileId}`)
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        rating: 5,
        comment: 'Amazing tutor!',
      })
      .expect(201);

    reviewId = res.body.id;
    expect(reviewId).toBeDefined();
  });

  // ----------------------------------------------------
  // 7. REVIEW: UPDATE
  // ----------------------------------------------------
  it('should allow student to update review', async () => {
    const res = await request(app.getHttpServer())
      .patch(`/reviews/${reviewId}`)
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        comment: 'Updated comment!',
      })
      .expect(200);

    expect(res.body.comment).toBe('Updated comment!');
  });

  // ----------------------------------------------------
  // 8. REVIEW: DELETE
  // ----------------------------------------------------
  it('should allow student to delete review', async () => {
    await request(app.getHttpServer())
      .delete(`/reviews/${reviewId}`)
      .set('Authorization', `Bearer ${studentToken}`)
      .expect(200);
  });
});
      