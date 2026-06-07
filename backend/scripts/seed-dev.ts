/**
 * Idempotent dev seed: admins, tutors (verified + pending), students,
 * platform bank account and a promo code. Safe to re-run.
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

const DEFAULT_PASSWORD = 'password123';
const ADMIN_PASSWORD = 'admin123';

async function ensureUser(
  email: string,
  role: UserRole,
  data: { name: string; phone: string; password?: string },
) {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return existing;
  return prisma.user.create({
    data: {
      email,
      name: data.name,
      password: await bcrypt.hash(data.password ?? DEFAULT_PASSWORD, 10),
      phoneNumber: data.phone,
      role,
      emailVerifiedAt: new Date(),
    },
  });
}

async function ensureTutorProfile(
  userId: string,
  data: {
    bio: string;
    subjects: Subject[];
    hourlyRate: number;
    experience: number;
    whatsapp: string;
    education: string;
    levels: EducationLevel[];
    methods: TeachingMethod[];
    verification: VerificationStatus;
    publish: boolean;
    bankHolder: string;
  },
) {
  const isVerified = data.verification === VerificationStatus.VERIFIED;
  return prisma.tutorProfile.upsert({
    where: { userId },
    update: {},
    create: {
      userId,
      bio: data.bio,
      subjects: data.subjects,
      hourlyRate: data.hourlyRate,
      experience: data.experience,
      whatsappNumber: data.whatsapp,
      educationBackground: data.education,
      educationLevels: data.levels,
      teachingMethods: data.methods,
      verificationStatus: data.verification,
      verifiedAt: isVerified ? new Date() : null,
      publishedAt: isVerified && data.publish ? new Date() : null,
      bankName: 'BCA',
      bankAccountNumber: '1234567890',
      bankAccountHolder: data.bankHolder,
    },
  });
}

async function ensureStudentProfile(
  userId: string,
  data: { bio: string; interests: Subject[]; school: string; whatsapp: string },
) {
  return prisma.studentProfile.upsert({
    where: { userId },
    update: {},
    create: {
      userId,
      bio: data.bio,
      interests: data.interests,
      school: data.school,
      whatsappNumber: data.whatsapp,
    },
  });
}

async function main() {
  // ---- Admin ----------------------------------------------------------
  const admin = await ensureUser('admin@dbbconnect.id', UserRole.ADMIN, {
    name: 'Site Admin',
    phone: '+6281200000000',
    password: ADMIN_PASSWORD,
  });

  // ---- Verified + published tutors ------------------------------------
  const alice = await ensureUser('tutor@dbbconnect.id', UserRole.TUTOR, {
    name: 'Alice Tutor',
    phone: '+6281200000001',
  });
  await ensureTutorProfile(alice.id, {
    bio: 'Tutor matematika dan fisika SMA dengan pengalaman 5 tahun.',
    subjects: [Subject.MATH, Subject.PHYSICS],
    hourlyRate: 100_000,
    experience: 5,
    whatsapp: '+6281200000001',
    education: 'BSc Mathematics, ITS',
    levels: [EducationLevel.SENIOR_HIGH, EducationLevel.UNIVERSITY],
    methods: [TeachingMethod.STRUCTURED, TeachingMethod.VISUAL],
    verification: VerificationStatus.VERIFIED,
    publish: true,
    bankHolder: 'Alice Tutor',
  });

  const charlie = await ensureUser('tutor2@dbbconnect.id', UserRole.TUTOR, {
    name: 'Charlie Coder',
    phone: '+6281200000003',
  });
  await ensureTutorProfile(charlie.id, {
    bio: 'Spesialis Computer Science dan persiapan olimpiade.',
    subjects: [Subject.COMPUTER_SCIENCE, Subject.MATH],
    hourlyRate: 150_000,
    experience: 7,
    whatsapp: '+6281200000003',
    education: 'MSc Computer Science, ITB',
    levels: [EducationLevel.SENIOR_HIGH, EducationLevel.UNIVERSITY],
    methods: [TeachingMethod.INTENSIVE, TeachingMethod.DISCUSSION],
    verification: VerificationStatus.VERIFIED,
    publish: true,
    bankHolder: 'Charlie Coder',
  });

  // ---- Pending verification tutor (admin queue smoke test) ------------
  const dani = await ensureUser(
    'tutor.pending@dbbconnect.id',
    UserRole.TUTOR,
    { name: 'Dani Draft', phone: '+6281200000004' },
  );
  await ensureTutorProfile(dani.id, {
    bio: 'Tutor bahasa Inggris, menunggu verifikasi.',
    subjects: [Subject.ENGLISH],
    hourlyRate: 80_000,
    experience: 3,
    whatsapp: '+6281200000004',
    education: 'BA English Literature, UI',
    levels: [EducationLevel.JUNIOR_HIGH, EducationLevel.SENIOR_HIGH],
    methods: [TeachingMethod.DISCUSSION],
    verification: VerificationStatus.PENDING,
    publish: false,
    bankHolder: 'Dani Draft',
  });

  // ---- Students ------------------------------------------------------
  const bob = await ensureUser('student@dbbconnect.id', UserRole.STUDENT, {
    name: 'Bob Student',
    phone: '+6281200000002',
  });
  await ensureStudentProfile(bob.id, {
    bio: 'Siswa kelas 12 SMA.',
    interests: [Subject.MATH, Subject.PHYSICS],
    school: 'SMA Negeri 1 Jakarta',
    whatsapp: '+6281200000002',
  });

  const emma = await ensureUser('student2@dbbconnect.id', UserRole.STUDENT, {
    name: 'Emma Engineer',
    phone: '+6281200000005',
  });
  await ensureStudentProfile(emma.id, {
    bio: 'Mahasiswa Teknik Informatika semester 3.',
    interests: [Subject.COMPUTER_SCIENCE, Subject.MATH],
    school: 'Institut Teknologi Sepuluh Nopember',
    whatsapp: '+6281200000005',
  });

  // ---- Active platform bank ------------------------------------------
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

  // ---- Demo promo code ------------------------------------------------
  await prisma.promoCode.upsert({
    where: { code: 'WELCOME10' },
    update: {},
    create: {
      code: 'WELCOME10',
      discountType: 'PERCENT',
      discountValue: 10,
      maxUses: 1000,
      validUntil: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      applicableKinds: ['SESSION', 'SUBSCRIPTION', 'FEATURED_LISTING'],
      createdBy: admin.id,
    },
  });

  console.log('\nDev seed complete.\n');
  console.log('Accounts (password: password123 unless noted):');
  console.log('  ADMIN   admin@dbbconnect.id            (password: admin123)');
  console.log('  TUTOR   tutor@dbbconnect.id            (verified + published, Math/Physics)');
  console.log('  TUTOR   tutor2@dbbconnect.id           (verified + published, CS/Math)');
  console.log('  TUTOR   tutor.pending@dbbconnect.id    (pending verification, English)');
  console.log('  STUDENT student@dbbconnect.id          (SMA 12)');
  console.log('  STUDENT student2@dbbconnect.id         (university)');
  console.log('Platform bank: BCA 9876543210 a.n. PT DBBConnect');
  console.log('Promo code:    WELCOME10 (10%, max 1000 uses, 90d expiry)');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
