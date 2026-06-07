/**
 * Idempotent dev seed: a few tutors, students, applications, sessions.
 *
 * Run: pnpm run seed:dev
 */
import {
  EducationLevel,
  PrismaClient,
  Subject,
  TeachingMethod,
  UserRole,
  VerificationStatus,
} from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function ensureUser(
  email: string,
  role: UserRole,
  data: { name: string; phone: string },
) {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return existing;
  return prisma.user.create({
    data: {
      email,
      name: data.name,
      password: await bcrypt.hash('password123', 10),
      phoneNumber: data.phone,
      role,
      emailVerifiedAt: new Date(),
    },
  });
}

async function main() {
  // Tutor
  const tutorUser = await ensureUser('tutor@dbbconnect.id', UserRole.TUTOR, {
    name: 'Alice Tutor',
    phone: '+6281200000001',
  });
  await prisma.tutorProfile.upsert({
    where: { userId: tutorUser.id },
    update: {},
    create: {
      userId: tutorUser.id,
      bio: 'Experienced Math tutor.',
      subjects: [Subject.MATH, Subject.PHYSICS],
      hourlyRate: 100000,
      experience: 5,
      whatsappNumber: '+6281200000001',
      educationBackground: 'BSc Mathematics, ITS',
      educationLevels: [EducationLevel.SENIOR_HIGH, EducationLevel.UNIVERSITY],
      teachingMethods: [TeachingMethod.STRUCTURED, TeachingMethod.VISUAL],
      verificationStatus: VerificationStatus.VERIFIED,
      verifiedAt: new Date(),
      publishedAt: new Date(),
      bankName: 'BCA',
      bankAccountNumber: '1234567890',
      bankAccountHolder: 'Alice Tutor',
    },
  });

  // Student
  const studentUser = await ensureUser(
    'student@dbbconnect.id',
    UserRole.STUDENT,
    { name: 'Bob Student', phone: '+6281200000002' },
  );
  await prisma.studentProfile.upsert({
    where: { userId: studentUser.id },
    update: {},
    create: {
      userId: studentUser.id,
      bio: 'High school senior.',
      interests: [Subject.MATH],
      school: 'SMA Negeri 1',
      whatsappNumber: '+6281200000002',
    },
  });

  // Active platform bank
  await prisma.platformBankAccount.upsert({
    where: { id: 'seed-bank' },
    update: {},
    create: {
      id: 'seed-bank',
      bankName: 'BCA',
      accountNumber: '9876543210',
      accountHolder: 'PT DBBConnect',
      isActive: true,
    },
  });

  console.log('Dev seed complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
