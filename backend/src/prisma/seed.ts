import { PrismaClient, UserRole, Subject, ApplicationStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding...');

  // ---------- USERS ----------
  const studentUser = await prisma.user.upsert({
    where: { email: 'student1@example.com' },
    update: {},
    create: {
      name: 'Student One',
      email: 'student1@example.com',
      password: 'password123', // ideally hashed
      phoneNumber: '081234567890',
      role: UserRole.STUDENT,
    },
  });

  const tutorUser = await prisma.user.upsert({
    where: { email: 'tutor1@example.com' },
    update: {},
    create: {
      name: 'Tutor One',
      email: 'tutor1@example.com',
      password: 'password123', // ideally hashed
      phoneNumber: '081234567891',
      role: UserRole.TUTOR,
    },
  });

  // ---------- PROFILES ----------
  const studentProfile = await prisma.studentProfile.upsert({
    where: { userId: studentUser.id },
    update: {},
    create: {
      userId: studentUser.id,
      bio: 'I am a student looking for tutors in Math and Physics.',
      interests: [Subject.MATH, Subject.PHYSICS],
      school: 'High School A',
    },
  });

  const tutorProfile = await prisma.tutorProfile.upsert({
    where: { userId: tutorUser.id },
    update: {},
    create: {
      userId: tutorUser.id,
      bio: 'I am an experienced Math and Physics tutor.',
      subjects: [Subject.MATH, Subject.PHYSICS],
      hourlyRate: 50,
      availability: {
        Monday: ['10:00', '14:00'],
        Wednesday: ['12:00', '16:00'],
      },
      experience: 5,
    },
  });

  // ---------- APPLICATION ----------
  const existingApp = await prisma.application.findFirst({
    where: {
      studentId: studentProfile.id,
      tutorId: tutorProfile.id,
    },
  });

  if (!existingApp) {
    await prisma.application.create({
      data: {
        studentId: studentProfile.id,
        tutorId: tutorProfile.id,
        status: ApplicationStatus.PENDING,
      },
    });
  }

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
